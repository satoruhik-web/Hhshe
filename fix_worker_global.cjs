const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(/API_ID = int\(31786340\)/g, "API_ID = 31786340");
code = code.replace(/API_HASH = str\('372df7642e9a81feae08269f84513ee5'\)/g, "API_HASH = '372df7642e9a81feae08269f84513ee5'");

code = code.replace(
    'client = TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")',
    'client = TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")'
);

// I see, the problem is my test script uses Telethon 1.44.0 which has specific tl function signature.
// It fails when `api_hash` is an int? Wait, but `API_HASH` is a string!
