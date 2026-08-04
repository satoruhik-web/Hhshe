const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Notice line 133 is `        </motion.div>` but it lacks the closing `</div>` for the container wrapping `div className="pt-4..."`? Wait, let's see.
const goodBlock = `
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm mb-1">{t('balance')}</p>
              <p className="font-medium text-3xl text-brand-purple">{user.balance.toFixed(2)} ₽</p>
            </div>
          </div>
        </motion.div>
`;
code = code.replace(
    /<div className="pt-4 border-t border-white\/10">\s*<p className="text-white\/50 text-sm mb-1">\{t\('balance'\)\}<\/p>\s*<p className="font-medium text-3xl text-brand-purple">\{user\.balance\.toFixed\(2\)\} ₽<\/p>\s*<\/div>\s*<\/motion.div>/,
    goodBlock
);

fs.writeFileSync('src/pages/Profile.tsx', code);
