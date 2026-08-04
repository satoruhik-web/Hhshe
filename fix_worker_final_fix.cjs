const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// I also need to make sure that the `phone` argument being passed is ALWAYS a string, and perhaps `phone` itself is causing issues?
// No, the test worker FINALLY printed SUCCESS: {"success": true, "phone_code_hash": "...", "session_string": "..."}
// That means the kwargs fix `api_id=..., api_hash=...` actually worked!

fs.writeFileSync('tg_worker.py', code);
