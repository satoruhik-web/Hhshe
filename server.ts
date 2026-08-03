import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const CRYPTOBOT_TOKEN = process.env.CRYPTOBOT_TOKEN || "617683:AA4Vn8wUREP9PUn2Hbil4FPSzpqBWTY3yUr";
const CRYPTOBOT_API = "https://pay.crypt.bot/api";

const dbPath = path.join(process.cwd(), 'db.json');
let db: any = {
  users: [{ id: 1, username: "admin", password: "admin", balance: 0, isAdmin: true }],
  products: [],
  purchases: [],
  topups: []
};

if (fs.existsSync(dbPath)) {
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (e) {
    console.error("Failed to parse db.json", e);
  }
} else {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function getCryptoRate(asset: string) {
   try {
       const response = await fetch(`${CRYPTOBOT_API}/getExchangeRates`, {
           headers: { 'Crypto-Pay-API-Token': CRYPTOBOT_TOKEN }
       });
       const data = await response.json();
       if (data.ok) {
           const rateObj = data.result.find((r: any) => r.source === asset && r.target === 'RUB');
           if (rateObj) return parseFloat(rateObj.rate);
       }
   } catch (e) {}
   return asset === 'USDT' ? 95 : 200;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin } });
    } else {
      res.status(401).json({ success: false, message: "Неверный логин или пароль" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (db.users.find((u: any) => u.username === username)) {
      return res.status(400).json({ success: false, message: "Пользователь уже существует" });
    }
    const newUser = { id: Date.now(), username, password, balance: 0, isAdmin: false };
    db.users.push(newUser);
    saveDb();
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, balance: newUser.balance, isAdmin: newUser.isAdmin } });
  });

  app.post("/api/auth/change-password", (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = db.users.find((u: any) => u.id === userId);
    if (user && user.password === oldPassword) {
        user.password = newPassword;
        saveDb();
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Неверный старый пароль" });
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.users.find((u: any) => u.id === parseInt(req.params.id));
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin } });
    } else {
      res.status(404).json({ success: false, message: "Пользователь не найден" });
    }
  });

  app.get("/api/products", (req, res) => {
    res.json({ success: true, products: db.products });
  });

  // Admin routes
  app.get("/api/admin/users", (req, res) => {
    res.json({ success: true, users: db.users.map((u: any) => ({ id: u.id, username: u.username, balance: u.balance, isAdmin: u.isAdmin })) });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    db.users = db.users.filter((u: any) => u.id !== parseInt(req.params.id));
    saveDb();
    res.json({ success: true });
  });

  app.post("/api/admin/products", (req, res) => {
    const newProduct = { id: Date.now(), ...req.body };
    db.products.push(newProduct);
    saveDb();
    res.json({ success: true, product: newProduct });
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    db.products = db.products.filter((p: any) => p.id !== parseInt(req.params.id));
    saveDb();
    res.json({ success: true });
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const index = db.products.findIndex((p: any) => p.id === parseInt(req.params.id));
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...req.body };
      saveDb();
      res.json({ success: true, product: db.products[index] });
    } else {
      res.status(404).json({ success: false, message: "Товар не найден" });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const todayPurchases = db.purchases.filter((p: any) => p.date.startsWith(today));
    const profitToday = todayPurchases.reduce((sum: number, p: any) => sum + p.price, 0);
    
    res.json({
      success: true,
      stats: {
        productsCount: db.products.length,
        usersCount: db.users.length,
        profitToday
      }
    });
  });

  // User actions
  app.post("/api/buy", (req, res) => {
    const { userId, productId } = req.body;
    const user = db.users.find((u: any) => u.id === userId);
    const productIndex = db.products.findIndex((p: any) => p.id === productId);

    if (!user || productIndex === -1) {
        return res.status(400).json({ success: false, message: "Товар не найден или уже куплен" });
    }

    const product = db.products[productIndex];

    if (user.balance < product.price) {
        return res.status(400).json({ success: false, message: "Недостаточно средств" });
    }

    user.balance -= product.price;
    const purchase = { ...product, purchaseId: Date.now(), date: new Date().toISOString(), userId };
    db.purchases.push(purchase);
    db.products.splice(productIndex, 1);
    saveDb();
    
    res.json({ success: true, message: "Покупка успешно завершена", balance: user.balance, purchase });
  });

  // Crypto Bot
  app.post("/api/topup/create", async (req, res) => {
    const { userId, amountRub, currency } = req.body;
    const rate = await getCryptoRate(currency);
    const cryptoAmount = (amountRub / rate).toFixed(4);

    try {
        const response = await fetch(`${CRYPTOBOT_API}/createInvoice`, {
            method: 'POST',
            headers: { 
              'Crypto-Pay-API-Token': CRYPTOBOT_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                asset: currency,
                amount: cryptoAmount,
                description: `Пополнение баланса на ${amountRub} RUB`,
            })
        });
        const data = await response.json();
        if (data.ok) {
            res.json({ success: true, invoiceId: data.result.invoice_id, payUrl: data.result.pay_url, cryptoAmount });
        } else {
            res.status(400).json({ success: false, message: data.error?.name || "Ошибка создания счета" });
        }
    } catch(e) {
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
  });

  app.post("/api/topup/check", async (req, res) => {
    const { invoiceId, userId, amountRub, currency } = req.body;
    try {
        const response = await fetch(`${CRYPTOBOT_API}/getInvoices?invoice_ids=${invoiceId}`, {
            headers: { 'Crypto-Pay-API-Token': CRYPTOBOT_TOKEN }
        });
        const data = await response.json();
        if (data.ok && data.result.items.length > 0) {
            const invoice = data.result.items[0];
            if (invoice.status === 'paid') {
                if (db.topups.find((t: any) => t.invoiceId === invoiceId)) {
                    return res.json({ success: true, alreadyProcessed: true });
                }
                const user = db.users.find((u: any) => u.id === userId);
                if (user) {
                    user.balance += amountRub;
                    db.topups.push({ id: Date.now(), invoiceId, amountRub, currency, date: new Date().toISOString(), userId });
                    saveDb();
                    return res.json({ success: true, balance: user.balance });
                }
            } else {
                return res.json({ success: false, status: invoice.status });
            }
        }
        res.json({ success: false, status: 'not_found' });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/user/:id/history", (req, res) => {
    const userId = parseInt(req.params.id);
    const userPurchases = db.purchases.filter((p: any) => p.userId === userId);
    const userTopups = db.topups.filter((t: any) => t.userId === userId);
    res.json({ success: true, purchases: userPurchases, topups: userTopups });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
