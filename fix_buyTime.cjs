const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
    /product\.buyerId = user\.id;/,
    "product.buyerId = user.id;\n    product.buyTime = new Date().toISOString();"
);

fs.writeFileSync('server.ts', code);
