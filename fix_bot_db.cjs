const fs = require('fs');
let code = fs.readFileSync('bot.ts', 'utf-8');

code = code.replace(
    /type BotDB = \{[\s\S]*?\};/,
    `type BotDB = { users: Record<number, User>; history: any[]; withdrawals: any[]; topups: any[]; settings: any; tg_sessions: any; products: any };`
);

fs.writeFileSync('bot.ts', code);
