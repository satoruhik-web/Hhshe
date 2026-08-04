const fs = require('fs');
let code = fs.readFileSync('tg_worker.py', 'utf-8');

code = code.replace(
    "API_HASH = '372df7642e9a81feae08269f84513ee5'",
    "API_HASH = str('372df7642e9a81feae08269f84513ee5')"
);

fs.writeFileSync('tg_worker.py', code);
