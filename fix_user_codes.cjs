const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `
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
`;

code = code.replace(/app\.get\('\/api\/product\/:id\/tdata'/, newEndpoint + '\n\napp.get(\'/api/product/:id/tdata\'');

fs.writeFileSync('server.ts', code);
