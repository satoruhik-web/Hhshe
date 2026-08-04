const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// I need to use `opentele.tl` for the `OpenTeleClient` which also inherits `TelegramClient`?
// No, the error happens in `TelegramClient`!
// What if `str(phone)` is not enough? Wait, `command.get("phone")` returns a string if it's sent as a string. But `phone_code_hash` needs to be string...
// Actually, earlier the user had sent `917385533016` as an INT via JSON `{"action": "request_code", "phone": 917385533016}`
// Wait! Wait! Wait! 
// In the traceback:
// `TypeError: bytes or str expected, not <class 'int'>`
// It happens inside `self.serialize_bytes(self.api_hash)`!
// It means `self.api_hash` is an INT!
// How can `self.api_hash` be an INT?
// `client = TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")`
// The `api_hash` we pass is a string!
// BUT WAIT. The telethon version is 1.44.0. In older or newer versions of Telethon, the order of parameters is different?!
// `TelegramClient(session, api_id, api_hash)`
// Let's look at TelegramClient init.

code = code.replace(
    /TelegramClient\(StringSession\(session_string\), 31786340, "372df7642e9a81feae08269f84513ee5"\)/g,
    'TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")'
);
fs.writeFileSync('tg_worker.py', code);
