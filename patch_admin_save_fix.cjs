const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// The save block was sending just the details, we need to pass session string too if it's there
const saveBlock = `
                          const res = await fetch('/api/admin/products', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                ...newProduct, 
                                price: parseFloat(newProduct.price),
                                idDigits: parseInt(newProduct.idDigits as any),
                                tgSessionString: tgSessionString
                              })
                          });
`;
code = code.replace(
    /const res = await fetch\('\/api\/admin\/products', \{[\s\S]*?tgSessionString: tgSessionString\n                              \}\)\n                          \}\);/,
    saveBlock.trim()
);

fs.writeFileSync('src/pages/Admin.tsx', code);
