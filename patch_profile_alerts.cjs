const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

if (!code.includes('sonner')) {
    code = code.replace(
        `import { useLanguage } from '../context/LanguageContext';`,
        `import { useLanguage } from '../context/LanguageContext';\nimport { toast } from 'sonner';`
    );
    
    code = code.replace(/alert\((.*)\)/g, (match, p1) => {
        if (p1.includes('Ошибка') || p1.includes('Не удалось')) {
            return `toast.error(${p1})`;
        }
        return `toast.success(${p1})`;
    });
}
fs.writeFileSync('src/pages/Profile.tsx', code);
