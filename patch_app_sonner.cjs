const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('Toaster')) {
    code = code.replace(
        `import { AuthProvider, useAuth } from './context/AuthContext';`,
        `import { Toaster } from 'sonner';\nimport { AuthProvider, useAuth } from './context/AuthContext';`
    );
    
    code = code.replace(
        `<BrowserRouter>`,
        `<BrowserRouter>\n      <Toaster theme="dark" position="top-center" />`
    );
}

fs.writeFileSync('src/App.tsx', code);
