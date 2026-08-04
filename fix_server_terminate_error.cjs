const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
    /        res\.json\(\{ success: true \}\);\n    \} else \{\n        res\.status\(404\)\.json\(\{ success: false \}\);\n    \}\n\}\);\n    \} else \{\n        res\.status\(404\)\.json\(\{ success: false \}\);\n    \}\n\}\);/g,
    "        res.json({ success: true });\n    } else {\n        res.status(404).json({ success: false });\n    }\n});"
);

fs.writeFileSync('server.ts', code);
