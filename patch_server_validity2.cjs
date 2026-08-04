const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const validityEndpoint = `
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
`;

code = code.replace(
    /app\.post\('\/api\/product\/check-validity', \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, message: 'Аккаунт валиден!' \}\);\n\}\);/,
    validityEndpoint.trim()
);

fs.writeFileSync('server.ts', code);
