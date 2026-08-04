const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
    /const daysOld = Math\.floor\(\(Date\.now\(\) - new Date\(sms\.buyTime\)\.getTime\(\)\) \/ \(1000 \* 60 \* 60 \* 24\)\);/,
    "const daysOld = sms.buyTime ? Math.floor((Date.now() - new Date(sms.buyTime).getTime()) / (1000 * 60 * 60 * 24)) : 0;"
);

fs.writeFileSync('src/pages/Profile.tsx', code);
