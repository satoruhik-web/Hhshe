const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    /if msg\.message and \("Login code:" in msg\.message or "Код для входа:" in msg\.message or "Web login code:" in msg\.message or "Код для входа в Ваш аккаунт Telegram:" in msg\.message\):/g,
    'if msg.message and ("Login code" in msg.message or "Код для входа" in msg.message or "Web login code" in msg.message):'
);

fs.writeFileSync('tg_worker.py', code);
