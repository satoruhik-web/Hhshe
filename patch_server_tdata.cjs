const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tdataEndpoint = `
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
`;

code = code.replace(
    /app\.post\('\/api\/product\/:id\/terminate-session', \(req, res\) => \{/,
    tdataEndpoint + "\napp.post('/api/product/:id/terminate-session', (req, res) => {"
);

fs.writeFileSync('server.ts', code);
