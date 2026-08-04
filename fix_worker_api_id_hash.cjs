const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// The issue might be that Telethon API ID is expected to be an int, and API HASH a string, but somewhere it fails. 
// "bytes or str expected, not <class 'int'>" in serialize_bytes(self.api_hash)
// So self.api_hash is an int? Wait, why would it be an int? 
// In TelegramClient(session, api_id, api_hash), if api_hash is passed as an int, this error happens.
// Are we passing api_id and api_hash in the wrong order?
// Telethon signature: TelegramClient(session, api_id, api_hash, ...)
// Let's print out what `client.api_hash` is in our script.

// Let's replace the TelegramClient initialization.
code = code.replace(
    /TelegramClient\(StringSession\(session_string\), 31786340, "372df7642e9a81feae08269f84513ee5"\)/g,
    'TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")'
);

fs.writeFileSync('tg_worker.py', code);
