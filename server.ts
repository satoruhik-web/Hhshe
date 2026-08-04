import fs from 'fs';
import express from 'express';

import { spawn } from 'child_process';
function runPythonWorker(command: any): Promise<any> {
    return new Promise((resolve) => {
        const py = spawn('python3', ['tg_worker.py']);
        let output = '';
        py.stdout.on('data', data => output += data.toString());
        py.stderr.on('data', data => console.error(data.toString()));
        py.on('close', () => {
            try {
                const lines = output.trim().split('\n');
                resolve(JSON.parse(lines[lines.length - 1]));
            } catch (e) {
                resolve({ success: false, message: "Python error" });
            }
        });
        py.stdin.write(JSON.stringify(command) + '\n');
        py.stdin.end();
    });
}

import path from 'path';
import { createServer as createViteServer } from 'vite';
import { startTelegramBot, db, saveDB, bot } from './bot';


function ensureAdmins() {
  const admins = [
    { username: 'Roman', password: 'Romka2012', first_name: 'Roman' },
    { username: 'Rostislav', password: '19863238r', first_name: 'Rostislav' }
  ];

  // Remove isAdmin from everyone first
  Object.values(db.users).forEach((u: any) => {
      if (u.username !== 'Roman' && u.username !== 'Rostislav') {
          u.isAdmin = false;
      }
  });
  db.settings.adminIds = [];

  for (const admin of admins) {
    const existing = Object.values(db.users).find((u) => u.username === admin.username);
    if (!existing) {
      const id = Date.now() + Math.floor(Math.random() * 100000);
      db.users[id] = {
        id,
        username: admin.username,
        first_name: admin.first_name,
        password: admin.password,
        balance: 0,
        lastBonus: 0,
        isBlocked: false,
        isAdmin: true
      };
      db.settings.adminIds.push(id);
    } else {
        existing.password = admin.password;
        existing.isAdmin = true;
        db.settings.adminIds.push(existing.id);
    }
  }
  saveDB();
}

ensureAdmins();

if (!db.products) db.products = {};

const app = express();
app.use(express.json());

app.use('/api/admin', (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: No user ID provided' });
    }
    const user = db.users[parseInt(userId as string)];
    if (!user || !user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not an admin' });
    }
    next();
});


// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const existing = Object.values(db.users).find((u: any) => u.username === username);
    if (existing) {
        return res.status(400).json({ success: false, message: 'Логин уже занят' });
    }
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newUser = {
        id: newId,
        username,
        password,
        balance: 0,
        lastBonus: 0,
        isBlocked: false,
        isAdmin: false
    };
    db.users[newId] = newUser;
    saveDB();
    res.json({ success: true, user: newUser });
});

app.get('/api/auth/me', (req, res) => {
    const userId = req.query.id as string;
    const user = db.users[parseInt(userId)];
    if (user) {
        if (user.isBlocked) {
            return res.json({ success: false, isBlocked: true, banReason: user.banReason, bannedUntil: user.bannedUntil });
        }
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { login, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    const user = Object.values(db.users).find((u: any) => 
        (u.username === login || u.phone === login) && u.password === password
    );
    
    if (user) {
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: `Аккаунт заблокирован.\nПричина: ${user.banReason || 'Не указана'}\nСрок: ${user.bannedUntil ? new Date(user.bannedUntil).toLocaleString() : 'Навсегда'}` });
        }
        user.ipAddress = ip;
        saveDB();
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Неверные данные для входа' });
    }
});

// Phone Auth Routes
app.post('/api/auth/request-code', async (req, res) => {
    let { phone } = req.body;
    phone = phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('+')) phone = '+' + phone;

    const user = Object.values(db.users).find((u) => u.phone === phone);
    
    if (!user) {
        return res.status(400).json({ success: false, message: 'Телефон не привязан. Пожалуйста, отправьте контакт в боте @EmoRoman' });
    }
    
    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    const token = Math.random().toString(36).substring(2);
    db.tokens[token] = { type: 'phone_code', userId: user.id, code, expiresAt, used: false };
    saveDB();
    
    try {
        await bot.telegram.sendMessage(user.id, 'Ваш код для входа: ' + code);
        res.json({ success: true, token });
    } catch (e) {
        console.error('Failed to send code', e);
        res.status(500).json({ success: false, message: 'Не удалось отправить код' });
    }
});

app.post('/api/auth/verify-code', (req, res) => {
    const { token, code } = req.body;
    const tokenData = db.tokens[token];
    
    if (!tokenData || tokenData.type !== 'phone_code' || tokenData.used) {
        return res.status(400).json({ success: false, message: 'Код недействителен' });
    }
    if (Date.now() > tokenData.expiresAt) {
        return res.status(400).json({ success: false, message: 'Срок действия кода истёк' });
    }
    if (tokenData.code !== code) {
        return res.status(400).json({ success: false, message: 'Неверный код' });
    }
    
    tokenData.used = true;
    const user = db.users[tokenData.userId];
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    user.ipAddress = ip;
    saveDB();
    
    res.json({ success: true, user });
});

// Topup
app.post('/api/topup/claim', (req, res) => {
    const { token, userId } = req.body;
    const tokenData = db.tokens[token];
    if (!tokenData || tokenData.type !== 'topup' || tokenData.used) {
        return res.status(400).json({ success: false, message: 'Недействительный токен пополнения' });
    }
    const user = db.users[userId];
    if (!user) {
         return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
    user.balance += tokenData.amount;
    tokenData.used = true;
    saveDB();
    res.json({ success: true, balance: user.balance });
});

app.post('/api/admin/topup-code', (req, res) => {
    const { amount } = req.body;
    const code = 'TELZO-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    db.tokens[code] = { type: 'topup', amount, used: false };
    saveDB();
    res.json({ success: true, code });
});

// Admin stats


app.post('/api/admin/bot-session/request', async (req, res) => {
    const { phone } = req.body;
    // We assume the phone format is correct
    const result = await runPythonWorker({ action: 'request_code', phone });
    if (result.success) {
        // Save phone_code_hash and session_string temporarily
        db.tg_sessions = db.tg_sessions || {};
        db.tg_sessions[phone] = {
            phone_code_hash: result.phone_code_hash,
            session_string: result.session_string
        };
        saveDB();
        res.json({ success: true, message: 'Код отправлен от Telegram (официальный)' });
    } else {
        res.json({ success: false, message: result.message || 'Ошибка отправки кода' });
    }
});


app.post('/api/admin/bot-session/submit', async (req, res) => {
    const { phone, code, productId } = req.body;
    const sessionData = (db.tg_sessions || {})[phone];
    if (!sessionData) return res.json({ success: false, message: 'Нет активной сессии для номера' });
    
    const result = await runPythonWorker({ 
        action: 'submit_code', 
        phone, 
        code, 
        phone_code_hash: sessionData.phone_code_hash,
        session_string: sessionData.session_string
    });
    
    if (result.success) {
        if (productId && db.products[productId]) {
            db.products[productId].hasBotSession = true;
            db.products[productId].tgSessionString = result.session_string;
            saveDB();
        }
        res.json({ success: true, message: 'Успешная авторизация в Telegram!', session_string: result.session_string });
    } else if (result.needs_2fa) {
        if (db.tg_sessions) {
             db.tg_sessions[phone].session_string = result.session_string;
             saveDB();
        }
        res.json({ success: false, needs_2fa: true, session_string: result.session_string });
    } else {
        res.json({ success: false, message: result.message || 'Неверный код' });
    }
});

app.post('/api/admin/bot-session/submit-2fa', async (req, res) => {
    const { phone, password, productId } = req.body;
    const sessionData = (db.tg_sessions || {})[phone];
    if (!sessionData) return res.json({ success: false, message: 'Нет активной сессии для номера' });
    
    const result = await runPythonWorker({ 
        action: 'submit_2fa', 
        phone, 
        password,
        session_string: sessionData.session_string
    });
    
    if (result.success) {
        if (productId && db.products[productId]) {
            db.products[productId].hasBotSession = true;
            db.products[productId].tgSessionString = result.session_string;
            saveDB();
        }
        res.json({ success: true, message: 'Успешная авторизация с 2FA!', session_string: result.session_string });
    } else {
        res.json({ success: false, message: result.message || 'Неверный пароль' });
    }
});

app.get('/api/admin/stats', (req, res) => {
    res.json({
        usersCount: Object.keys(db.users).length,
        totalBalance: Object.values(db.users).reduce((acc: number, u: any) => acc + (u.balance || 0), 0),
        productsCount: Object.values(db.products || {}).filter(p => p.status === 'active').length
    });
});


app.get('/api/admin/promos', (req, res) => {
    res.json({ success: true, promos: Object.values(db.promos || {}) });
});

app.post('/api/admin/promos', (req, res) => {
    const { code, amount, maxUses, expiryMinutes, createdBy, hideAdmin } = req.body;
    if (!code || !amount) return res.status(400).json({ success: false, message: 'Invalid data' });
    
    if (!db.promos) db.promos = {};
    
    const expiresAt = expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : null;
    
    db.promos[code] = {
        code,
        amount: parseInt(amount),
        maxUses: maxUses ? parseInt(maxUses) : null,
        uses: 0,
        expiry: expiresAt,
        createdBy: createdBy || 'Admin',
        hideAdmin: !!hideAdmin,
        createdAt: Date.now(),
        usedBy: []
    };
    saveDB();
    res.json({ success: true, promo: db.promos[code] });
});

app.delete('/api/admin/promos/:code', (req, res) => {
    const { code } = req.params;
    if (db.promos && db.promos[code]) {
        delete db.promos[code];
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.post('/api/promo/use', (req, res) => {
    const { userId, code } = req.body;
    if (!db.promos) db.promos = {};
    const promo = db.promos[code];
    
    if (!promo) {
        return res.status(404).json({ success: false, message: 'Промокод не найден' });
    }
    
    if (promo.expiry && Date.now() > promo.expiry) {
        return res.status(400).json({ success: false, message: 'Срок действия промокода истёк' });
    }
    
    if (promo.maxUses !== null && promo.uses >= promo.maxUses) {
        return res.status(400).json({ success: false, message: 'Промокод больше не действителен' });
    }
    
    if (promo.usedBy.some((u: any) => u.userId === userId)) {
        return res.status(400).json({ success: false, message: 'Вы уже использовали этот промокод' });
    }
    
    const user = db.users[userId];
    if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
    
    promo.uses += 1;
    promo.usedBy.push({ userId, usedAt: Date.now() });
    
    user.balance = (user.balance || 0) + promo.amount;
    saveDB();
    
    res.json({ 
        success: true, 
        amount: promo.amount,
        createdBy: promo.hideAdmin ? null : promo.createdBy,
        newBalance: user.balance
    });
});

app.get('/api/admin/users', (req, res) => {
    res.json({ success: true, users: Object.values(db.users) });
});

app.post('/api/admin/ban', (req, res) => {
    const { userId, reason, durationMs } = req.body;
    const user = db.users[userId];
    if (user) {
        user.isBlocked = true;
        user.banReason = reason;
        user.bannedUntil = durationMs ? Date.now() + durationMs : null;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
});

app.post('/api/admin/unban', (req, res) => {
    const { userId } = req.body;
    const user = db.users[userId];
    if (user) {
        user.isBlocked = false;
        user.banReason = null;
        user.bannedUntil = null;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
});

// Products
app.get('/api/products', (req, res) => {
    const activeProducts = Object.values(db.products || {}).filter(p => p.status === 'active');
    res.json({ success: true, products: activeProducts });
});

app.get('/api/admin/products', (req, res) => {
    res.json({ success: true, products: Object.values(db.products || {}) });
});

app.post('/api/admin/products', (req, res) => {
    const id = Date.now();
    const product = { 
        id, 
        status: 'active',
        addedDate: Date.now(),
        ...req.body 
    };
    db.products[id] = product;
    saveDB();
    res.json({ success: true, product });
});

app.put('/api/admin/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (db.products[id]) {
        db.products[id] = { ...db.products[id], ...req.body };
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/admin/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (db.products[id]) {
        delete db.products[id];
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.post('/api/product/check-validity', async (req, res) => {
    const { productId } = req.body;
    const product = db.products[productId];
    if (!product) return res.status(404).json({ success: false, message: 'Товар не найден' });
    
    if (product.hasBotSession && product.tgSessionString) {
        try {
            const result = await runPythonWorker({ 
                action: 'check_validity', 
                session_string: product.tgSessionString 
            });
            if (result.success && result.valid) {
                res.json({ success: true, message: 'Аккаунт валиден!' });
            } else {
                product.status = 'invalid_review';
                saveDB();
                res.json({ success: false, message: 'Аккаунт невалиден! Отправлен на проверку.', status: 'invalid_review' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: 'Ошибка проверки' });
        }
    } else {
        res.json({ success: true, message: 'Аккаунт валиден (без сессии бота)' });
    }
});

app.post('/api/buy', (req, res) => {
    const { userId, productId } = req.body;
    const user = db.users[userId];
    const product = db.products[productId];
    
    if (!user || !product) return res.status(404).json({ success: false, message: 'Not found' });
    if (product.status !== 'active') return res.status(400).json({ success: false, message: 'Товар уже продан или недоступен' });
    if (user.balance < product.price) return res.status(400).json({ success: false, message: 'Недостаточно средств' });
    
    user.balance -= product.price;
    product.status = 'sold';
    product.buyerId = user.id;
    product.buyTime = new Date().toISOString();
    
    db.history = db.history || [];
    db.history.push({
        id: Date.now(),
        userId: user.id,
        productId: product.id,
        type: 'buy',
        amount: product.price,
        date: Date.now()
    });
    
    saveDB();
    res.json({ success: true, balance: user.balance });
});


app.get('/api/user/:id/history', (req, res) => {
    const userId = parseInt(req.params.id);
    const userPurchases = Object.values(db.products || {}).filter(p => p.buyerId === userId);
    
    // Convert to the format expected by Profile
    const purchases = userPurchases.map(p => ({
        purchaseId: p.id, // using product id
        productId: p.id,
        country: p.country,
        price: p.price,
        date: p.addedDate, // or actual buy date if we saved it in product
        phone: p.phone,
        cloudPassword: p.cloudPassword,
        hasBotSession: p.hasBotSession
    }));
    
    const topups = (db.history || []).filter(h => h.userId === userId && h.type === 'topup').map(h => ({
        id: h.id,
        amountRub: h.amount,
        currency: 'Code',
        date: h.date
    }));
    
    res.json({ success: true, purchases, topups });
});

app.get('/api/user/:id/purchases', (req, res) => {
    const userId = parseInt(req.params.id);
    const purchases = Object.values(db.products || {}).filter(p => p.buyerId === userId);
    res.json({ success: true, purchases });
});

app.post('/api/product/:id/request-code', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = db.products[id];
    if (product && product.hasBotSession && product.tgSessionString) {
        try {
            const result = await runPythonWorker({ 
                action: 'get_recent_code', 
                session_string: product.tgSessionString 
            });
            if (result.success) {
                res.json({ success: true, code: result.code });
            } else {
                res.status(400).json({ success: false, message: result.message || 'Ошибка при получении кода' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Сессия бота недоступна. Попросите администратора перепривязать аккаунт.' });
    }
});



app.get('/api/user/codes', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false });

    const userProducts = Object.values(db.products).filter((p: any) => p.buyerId === parseInt(userId as string) && p.hasBotSession && p.tgSessionString);
    
    // Check all in parallel (might be heavy if many, but fine for small amounts)
    const results = await Promise.all(userProducts.map(async (p: any) => {
        try {
            const result = await runPythonWorker({ 
                action: 'get_recent_code', 
                session_string: p.tgSessionString 
            });
            if (result.success && result.code) {
                return {
                    productId: p.id,
                    phone: p.phone,
                    country: p.country,
                    buyTime: p.buyTime,
                    code: result.code
                };
            }
        } catch(e) {}
        return null;
    }));

    const codes = results.filter(r => r !== null);
    res.json({ success: true, codes });
});


app.get('/api/product/:id/tdata', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = db.products[id];
    if (product && product.hasBotSession && product.tgSessionString) {
        try {
            const result = await runPythonWorker({ 
                action: 'export_tdata', 
                product_id: id,
                session_string: product.tgSessionString 
            });
            if (result.success && result.zip_file) {
                res.download(result.zip_file, 'tdata.zip', (err) => {
                    if (!err) {
                        // Cleanup after download
                        fs.unlinkSync(result.zip_file);
                    }
                });
            } else {
                res.status(400).json({ success: false, message: result.message || 'Ошибка экспорта TData' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Сессия бота недоступна' });
    }
});

app.post('/api/product/:id/terminate-session', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = db.products[id];
    if (product) {
        if (product.hasBotSession && product.tgSessionString) {
            try {
                await runPythonWorker({
                    action: 'log_out',
                    session_string: product.tgSessionString
                });
            } catch (e) {
                console.error('Error logging out tg_worker:', e);
            }
        }
        product.hasBotSession = false;
        product.tgSessionString = undefined;
        saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// --- Vite Middleware ---
async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
        startTelegramBot();
    });
}
startServer();
