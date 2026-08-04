const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    'phone = command.get("phone")',
    'phone = str(command.get("phone"))'
);

fs.writeFileSync('tg_worker.py', code);
