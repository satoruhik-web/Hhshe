const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// I will add a language selector to the profile settings
const langState = `
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ru');
`;
code = code.replace(
  `const [loading, setLoading] = useState(true);`,
  `const [loading, setLoading] = useState(true);\n${langState}`
);

const langUI = `
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-1">
                <p className="text-white/50 text-sm">Язык интерфейса / Language / Мова</p>
              </div>
              <select 
                value={lang} 
                onChange={(e) => {
                    setLang(e.target.value);
                    localStorage.setItem('lang', e.target.value);
                    toast.success('Язык изменен / Language changed');
                }}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="uk">Українська</option>
              </select>
            </div>
`;
code = code.replace(
    /<\/div>\n          <\/div>\n        <\/motion\.div>/,
    `${langUI}\n          </div>\n        </motion.div>`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
