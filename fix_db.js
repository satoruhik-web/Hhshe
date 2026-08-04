const fs = require('fs');
let code = fs.readFileSync('bot.ts', 'utf-8');
code = code.replace(/settings:\s*\{[^}]+\},\s*promos:\s*\{\}\s*\};/, "$&\n    tokens: {},");
if (!code.includes('tokens: {')) {
    code = code.replace(/promos:\s*\{\}/, "promos: {}, tokens: {}");
}
fs.writeFileSync('bot.ts', code);
