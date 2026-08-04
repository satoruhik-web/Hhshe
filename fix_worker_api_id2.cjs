const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    /API_ID = int\(31786340\)/,
    "API_ID = 31786340"
);

code = code.replace(
    "API_HASH = str('372df7642e9a81feae08269f84513ee5')",
    "API_HASH = '372df7642e9a81feae08269f84513ee5'"
);

// Ah wait, it's about `phone` being passed to SendCodeRequest which expects a string, BUT if phone comes in as int it fails.
// However we did `phone = str(...)`. Let's check where else we pass things.

code = code.replace(
    'client = TelegramClient(StringSession(session_string), API_ID, API_HASH)',
    'client = TelegramClient(StringSession(session_string), int(API_ID), str(API_HASH))'
);

code = code.replace(
    'await client.send_code_request(phone)',
    'await client.send_code_request(str(phone))'
);

fs.writeFileSync('tg_worker.py', code);
