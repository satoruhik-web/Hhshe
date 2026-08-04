const fs = require('fs');

['src/App.tsx', 'src/pages/Catalog.tsx', 'src/pages/TopUp.tsx'].forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf-8');
    
    // Skip adding sonner import to App.tsx since we already added it
    if (file !== 'src/App.tsx' && !code.includes('sonner')) {
        code = code.replace(
            `import { useAuth } from '../context/AuthContext';`,
            `import { useAuth } from '../context/AuthContext';\nimport { toast } from 'sonner';`
        );
    }
    
    code = code.replace(/alert\((.*)\)/g, (match, p1) => {
        if (p1.includes('Ошибка') || p1.includes('Не удалось') || p1.includes('Недостаточно')) {
            return `toast.error(${p1})`;
        }
        return `toast.success(${p1})`;
    });
    
    fs.writeFileSync(file, code);
});
