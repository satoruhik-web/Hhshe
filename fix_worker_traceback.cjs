const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    'print(json.dumps({"success": False, "message": str(e)}))',
    'import traceback; traceback.print_exc(); print(json.dumps({"success": False, "message": str(e)}))'
);

fs.writeFileSync('tg_worker.py', code);
