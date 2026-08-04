const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const mockEndpoint = `
app.post('/api/admin/bot-session/request', (req, res) => {
    const { phone } = req.body;
    // Simulate API call
    res.json({ success: true, message: 'Код отправлен на ' + phone });
});
`;

code = code.replace(`app.get('/api/admin/stats', (req, res) => {`, mockEndpoint + `\napp.get('/api/admin/stats', (req, res) => {`);
code = code.replace(`@Testgrgegeammbot`, `@EmoRoman`);

fs.writeFileSync('server.ts', code);
