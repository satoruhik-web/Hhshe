const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const promoApi = `
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
`;

code = code.replace(/app\.get\('\/api\/admin\/users'/g, promoApi + "\napp.get('/api/admin/users'");

fs.writeFileSync('server.ts', code);
