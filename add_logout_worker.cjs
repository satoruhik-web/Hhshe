const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

const logOutCode = `    elif action == "log_out":
        try:
            client = TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")
            await client.connect()
            await client.log_out()
            print(json.dumps({"success": True}))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
`;

code = code.replace(/    else:\n        print\(json.dumps\(\{"success": False, "message": "Unknown action"\}\)\)/, logOutCode + '    else:\n        print(json.dumps({"success": False, "message": "Unknown action"}))');

fs.writeFileSync('tg_worker.py', code);
