const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');
serverCode = serverCode.replace(
    /app\.post\('\/api\/topup\/claim', \(req, res\) => \{\n    const \{ token, phone \} = req\.body;\n    const tokenData = db\.tokens\[token\];\n    if \(!tokenData \|\| tokenData\.type !== 'topup' \|\| tokenData\.used\) \{\n        return res\.status\(400\)\.json\(\{ success: false, message: 'Недействительный токен пополнения' \}\);\n    \}\n    const user = Object\.values\(db\.users\)\.find\(\(u: any\) => u\.phone === phone\);\n    if \(!user\) \{/,
    "app.post('/api/topup/claim', (req, res) => {\n    const { token, userId } = req.body;\n    const tokenData = db.tokens[token];\n    if (!tokenData || tokenData.type !== 'topup' || tokenData.used) {\n        return res.status(400).json({ success: false, message: 'Недействительный токен пополнения' });\n    }\n    const user = db.users[userId];\n    if (!user) {"
);
fs.writeFileSync('server.ts', serverCode);

let topupCode = fs.readFileSync('src/pages/TopUp.tsx', 'utf-8');
topupCode = topupCode.replace(
    /body: JSON\.stringify\(\{ token: topupCode\.trim\(\), phone: user\?\.phone \}\)/g,
    "body: JSON.stringify({ token: topupCode.trim(), userId: user?.id })"
);
fs.writeFileSync('src/pages/TopUp.tsx', topupCode);
