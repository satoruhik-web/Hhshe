const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    /if not session_string:\n\s*print\(json\.dumps\(\{"success": False, "message": "No session string provided"\}\)\)/,
    'if not session_string:\n            print(json.dumps({"success": False, "message": "No session string provided"}))\n            return'
);
code = code.replace(
    /if not await client\.is_user_authorized\(\):\n\s*print\(json\.dumps\(\{"success": False, "message": "Not authorized"\}\)\)/,
    'if not await client.is_user_authorized():\n                print(json.dumps({"success": False, "message": "Not authorized"}))\n                return'
);

fs.writeFileSync('tg_worker.py', code);
