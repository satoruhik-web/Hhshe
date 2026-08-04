const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
    `import { Toaster } from 'sonner';`,
    `import { Toaster, toast } from 'sonner';`
);
fs.writeFileSync('src/App.tsx', code);
