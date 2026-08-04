const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    /TelegramClient\(StringSession\(session_string\), 31786340, "372df7642e9a81feae08269f84513ee5"\)/g,
    'TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")'
);

fs.writeFileSync('tg_worker.py', code);
