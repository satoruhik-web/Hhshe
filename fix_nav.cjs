const fs = require('fs');
let code = fs.readFileSync('src/components/Navigation.tsx', 'utf-8');

code = code.replace(
    'className="flex justify-center p-6 w-full max-w-4xl mx-auto"',
    'className="flex justify-center p-4 w-full max-w-3xl mx-auto"'
);

code = code.replace(
    '"flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"',
    '"flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"'
);

fs.writeFileSync('src/components/Navigation.tsx', code);
