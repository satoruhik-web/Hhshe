const fs = require('fs');
let code = fs.readFileSync('bot.ts', 'utf-8');

code = code.replace(
    /export let db: BotDB = \{[\s\S]*? history: \[\]\n\};/,
    `export let db: BotDB = {\n  users: {},\n  promos: {},\n  settings: {\n    dailyBonus: 1500,\n    adminIds: [],\n  },\n  tokens: {},\n  history: [],\n  withdrawals: [],\n  topups: [],\n  tg_sessions: {},\n  products: {}\n};`
);

fs.writeFileSync('bot.ts', code);
