const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

// I notice Telethon `send_code_request(phone, api_id=..., api_hash=...)` exists.
// Wait! SendCodeRequest in Telethon 1.44.0 takes: phone_number, api_id, api_hash, settings
// By default, `client.send_code_request` passes `client.api_id` and `client.api_hash`.
// If `self.api_hash` is being passed to `SerializeBytes`, it expects bytes or str.
// The error is: `self.serialize_bytes(self.api_hash)`.
// But wait, `auth.SendCodeRequest` signature in raw API:
// SendCodeRequest(phone_number: str, api_id: int, api_hash: str, settings: CodeSettings)
// Wait... if API_ID and API_HASH are passed as positional arguments to `send_code_request`?
// No, `client.send_code_request(phone)`

code = code.replace(
    'result = await client.send_code_request(str(phone))',
    'result = await client.send_code_request(phone, force_sms=False)'
);

fs.writeFileSync('tg_worker.py', code);
