const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// Add check_validity action
const checkValidityAction = `
    elif action == "check_validity":
        session_string = req.get("session_string")
        if not session_string:
            return {"success": False, "message": "No session string provided"}
        try:
            client = TelegramClient(StringSession(session_string), API_ID, API_HASH)
            await client.connect()
            if not await client.is_user_authorized():
                return {"success": False, "message": "Not authorized"}
            me = await client.get_me()
            await client.disconnect()
            return {"success": True, "valid": True, "username": me.username, "id": me.id}
        except Exception as e:
            return {"success": False, "message": str(e)}
`;

code = code.replace(
    /elif action == "export_tdata":/,
    checkValidityAction.trim() + "\n    elif action == \"export_tdata\":"
);

fs.writeFileSync('tg_worker.py', code);
