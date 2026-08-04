const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
if (!code.includes("import fs from 'fs';")) {
  code = "import fs from 'fs';\n" + code;
  fs.writeFileSync('server.ts', code);
}
