const fs = require('fs');
let code = fs.readFileSync('src/context/LanguageContext.tsx', 'utf-8');

code = code.replace(`ru: {`, `ru: {\n    nav_products: 'Товары',\n    nav_topup: 'Пополнить',\n    nav_profile: 'Профиль',\n    nav_admin: 'Админ',`);
code = code.replace(`en: {`, `en: {\n    nav_products: 'Products',\n    nav_topup: 'Top Up',\n    nav_profile: 'Profile',\n    nav_admin: 'Admin',`);
code = code.replace(`uk: {`, `uk: {\n    nav_products: 'Товари',\n    nav_topup: 'Поповнити',\n    nav_profile: 'Профіль',\n    nav_admin: 'Адмін',`);

fs.writeFileSync('src/context/LanguageContext.tsx', code);
