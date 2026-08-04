const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Let's remove the duplicated declaration
code = code.replace(
  /const \[lang, setLang\] = useState\(localStorage.getItem\('lang'\) \|\| 'ru'\);\n/g,
  ""
);
code = code.replace(
  `const [loading, setLoading] = useState(true);`,
  `const [loading, setLoading] = useState(true);\n  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ru');`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
