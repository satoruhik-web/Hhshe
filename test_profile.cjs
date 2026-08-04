const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');
const before = `<div className="pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm mb-1">{t('balance')}</p>
              <p className="font-medium text-3xl text-brand-purple">{user.balance.toFixed(2)} ₽</p>
            </div>
        </motion.div>`;

// We have a syntax error because there's an extra closing div somewhere.
// Let's replace the whole block of the first motion.div inside <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

const oldBlock = code.substring(
    code.indexOf('{/* User Info Card */}'),
    code.indexOf('{/* Actions Card */}')
);
console.log(oldBlock);
