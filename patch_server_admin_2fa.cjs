const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const submitEndpoint = `
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
`;

code = code.replace(
    /app\.post\('\/api\/admin\/bot-session\/submit', async \(req, res\) => \{[\s\S]*?\}\);/,
    submitEndpoint.trim()
);

fs.writeFileSync('server.ts', code);
