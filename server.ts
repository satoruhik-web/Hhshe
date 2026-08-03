import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Mock Database
let users = [
  { id: 1, username: "admin", password: "password", balance: 500, isAdmin: true },
  { id: 2, username: "user", password: "password", balance: 100, isAdmin: false }
];

let products = [
  { id: 1, country: "США", registration: "2019", twoFA: "Да", spamBlock: "Нет", price: 12.50 },
  { id: 2, country: "Великобритания", registration: "2020", twoFA: "Да", spamBlock: "Нет", price: 14.90 },
  { id: 3, country: "Германия", registration: "2018", twoFA: "Нет", spamBlock: "Нет", price: 9.90 },
  { id: 4, country: "Нидерланды", registration: "2021", twoFA: "Да", spamBlock: "Нет", price: 11.00 },
  { id: 5, country: "Франция", registration: "2017", twoFA: "Да", spamBlock: "Да", price: 19.99 },
];

let purchases = [];
let topups = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin } });
    } else {
      res.status(401).json({ success: false, message: "Неверный логин или пароль" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: "Пользователь уже существует" });
    }
    const newUser = { id: users.length + 1, username, password, balance: 0, isAdmin: false };
    users.push(newUser);
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, balance: newUser.balance, isAdmin: newUser.isAdmin } });
  });

  app.get("/api/user/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin } });
    } else {
      res.status(404).json({ success: false, message: "Пользователь не найден" });
    }
  });

  app.get("/api/products", (req, res) => {
    res.json({ success: true, products });
  });

  // Admin routes
  app.get("/api/admin/users", (req, res) => {
    res.json({ success: true, users: users.map(u => ({ id: u.id, username: u.username, balance: u.balance, isAdmin: u.isAdmin })) });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    users = users.filter(u => u.id !== parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/admin/products", (req, res) => {
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    res.json({ success: true, product: newProduct });
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    products = products.filter(p => p.id !== parseInt(req.params.id));
    res.json({ success: true });
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      res.json({ success: true, product: products[index] });
    } else {
      res.status(404).json({ success: false, message: "Товар не найден" });
    }
  });

  app.post("/api/admin/check-validity", (req, res) => {
    // Simulate validity check and removing some invalid accounts
    const invalidCount = Math.floor(Math.random() * 2);
    for(let i=0; i<invalidCount; i++) {
        if (products.length > 0) products.pop(); // simply remove last
    }
    res.json({ success: true, removed: invalidCount, message: `Проверка завершена. Удалено недействительных: ${invalidCount}` });
  });

  app.get("/api/admin/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const todayPurchases = purchases.filter(p => p.date.startsWith(today));
    const profitToday = todayPurchases.reduce((sum, p) => sum + p.price, 0);
    
    res.json({
      success: true,
      stats: {
        productsCount: products.length,
        usersCount: users.length,
        profitToday
      }
    });
  });

  // User actions
  app.post("/api/buy", (req, res) => {
    const { userId, productId } = req.body;
    const user = users.find(u => u.id === userId);
    const productIndex = products.findIndex(p => p.id === productId);

    if (!user || productIndex === -1) {
        return res.status(400).json({ success: false, message: "Ошибка данных" });
    }

    const product = products[productIndex];

    if (user.balance < product.price) {
        return res.status(400).json({ success: false, message: "Недостаточно средств" });
    }

    // Simulate validity check during purchase
    const isValid = Math.random() > 0.1; // 90% chance it's valid
    if (!isValid) {
        // Remove from sale
        products.splice(productIndex, 1);
        return res.status(400).json({ success: false, message: "Аккаунт недействителен. Покупка отменена." });
    }

    user.balance -= product.price;
    const purchase = { ...product, purchaseId: Date.now(), date: new Date().toISOString(), userId };
    purchases.push(purchase);
    products.splice(productIndex, 1); // Remove from catalog
    
    res.json({ success: true, message: "Покупка успешно завершена", balance: user.balance, purchase });
  });

  app.post("/api/topup", (req, res) => {
    const { userId, amountRub, currency } = req.body;
    const user = users.find(u => u.id === userId);
    
    if (!user) return res.status(400).json({ success: false, message: "Пользователь не найден" });

    user.balance += amountRub;
    const topup = { id: Date.now(), amountRub, currency, date: new Date().toISOString(), userId };
    topups.push(topup);

    res.json({ success: true, balance: user.balance, topup });
  });

  app.get("/api/user/:id/history", (req, res) => {
    const userId = parseInt(req.params.id);
    const userPurchases = purchases.filter(p => p.userId === userId);
    const userTopups = topups.filter(t => t.userId === userId);
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
