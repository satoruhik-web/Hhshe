const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
    `import { AuthProvider, useAuth } from './context/AuthContext';`,
    `import { AuthProvider, useAuth } from './context/AuthContext';\nimport { LanguageProvider } from './context/LanguageContext';`
);

code = code.replace(
    `<AuthProvider>`,
    `<AuthProvider>\n        <LanguageProvider>`
);

code = code.replace(
    `</AuthProvider>`,
    `</LanguageProvider>\n      </AuthProvider>`
);

fs.writeFileSync('src/App.tsx', code);
