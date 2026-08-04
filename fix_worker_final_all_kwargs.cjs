const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// I also need to replace the API_ID and API_HASH initialization in submit_code, submit_2fa, get_recent_code, check_validity, export_tdata!

code = code.replace(
    /TelegramClient\(StringSession\(session_string\), 31786340, "372df7642e9a81feae08269f84513ee5"\)/g,
    'TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")'
);

code = code.replace(
    /TelegramClient\(StringSession\(session_string\), API_ID, API_HASH\)/g,
    'TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")'
);

code = code.replace(
    /OpenTeleClient\(StringSession\(session_string\), API_ID, API_HASH\)/g,
    'OpenTeleClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")'
);

fs.writeFileSync('tg_worker.py', code);
