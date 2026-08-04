const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

code = code.replace(
    /              <div className="space-y-4 pr-2">\n                <div className="relative z-50">/,
    '                <div className="relative z-50">'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
