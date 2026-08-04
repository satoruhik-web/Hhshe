const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

if (!code.includes('useLanguage')) {
    code = code.replace(
        `import { useLocation, Link } from 'react-router-dom';`,
        `import { useLocation, Link } from 'react-router-dom';\nimport { useLanguage } from '../context/LanguageContext';`
    );
    
    code = code.replace(
        `export function Layout({ children }: { children: React.ReactNode }) {\n  const location = useLocation();`,
        `export function Layout({ children }: { children: React.ReactNode }) {\n  const location = useLocation();\n  const { t } = useLanguage();`
    );
    
    // Add layout translation keys
    // <span className="text-[10px] font-medium mt-1">Товары</span> -> {t('nav_products')}
    code = code.replace(/>Товары<\/span>/g, `>{t('nav_products')}</span>`);
    code = code.replace(/>Пополнить<\/span>/g, `>{t('nav_topup')}</span>`);
    code = code.replace(/>Профиль<\/span>/g, `>{t('nav_profile')}</span>`);
    code = code.replace(/>Админ<\/span>/g, `>{t('nav_admin')}</span>`);
}

fs.writeFileSync('src/components/Layout.tsx', code);
