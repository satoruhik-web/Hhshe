const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const term = `app.post('/api/product/:id/terminate-session', async (req, res) => {
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
});`;

code = code.replace(/app\.post\('\/api\/product\/:id\/terminate-session', \(req, res\) => \{[\s\S]*?\}\);/, term);

fs.writeFileSync('server.ts', code);
