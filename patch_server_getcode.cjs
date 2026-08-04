const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const getCodeEndpoint = `
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
`;

code = code.replace(
    /app\.post\('\/api\/product\/:id\/request-code', \(req, res\) => \{[\s\S]*?\}\);/,
    getCodeEndpoint.trim()
);

fs.writeFileSync('server.ts', code);
