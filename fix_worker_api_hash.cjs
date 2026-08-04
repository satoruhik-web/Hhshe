const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// I think the issue is that API_HASH is being serialized as an int, somehow.
// Let's hardcode the api_id and api_hash in the function directly to see if it fixes it.

code = code.replace(
    /TelegramClient\(StringSession\(session_string\), 31786340, "372df7642e9a81feae08269f84513ee5"\)/g,
    'TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")'
);

fs.writeFileSync('tg_worker.py', code);
