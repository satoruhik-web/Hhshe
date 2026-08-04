const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const pythonRunner = `
const { spawn } = require('child_process');
function runPythonWorker(command) {
    return new Promise((resolve) => {
        const py = spawn('python3', ['tg_worker.py']);
        let output = '';
        py.stdout.on('data', data => output += data.toString());
        py.stderr.on('data', data => console.error(data.toString()));
        py.on('close', () => {
            try {
                const lines = output.trim().split('\\n');
                resolve(JSON.parse(lines[lines.length - 1]));
            } catch (e) {
                resolve({ success: false, message: "Python error" });
            }
        });
        py.stdin.write(JSON.stringify(command) + '\\n');
        py.stdin.end();
    });
}
`;

// Insert it somewhere at the top, after imports
code = code.replace(`import cors from 'cors';`, `import cors from 'cors';\n${pythonRunner}`);

// Replace the mock request endpoint
const requestEndpoint = `
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
        res.json({ success: true, message: 'Успешная авторизация в Telegram!' });
    } else {
        res.json({ success: false, message: result.message || 'Неверный код' });
    }
});
`;

code = code.replace(
    /app\.post\('\/api\/admin\/bot-session\/request', \(req, res\) => \{[\s\S]*?\}\);/,
    requestEndpoint
);

fs.writeFileSync('server.ts', code);
