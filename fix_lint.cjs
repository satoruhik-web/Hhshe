const fs = require('fs');

// Admin.tsx has missing state definitions for sessionStep, botCode, tgSessionString
let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');
const missingState = `
  const [sessionStep, setSessionStep] = useState<'initial' | 'phone' | 'code' | '2fa' | 'details'>('initial');
  const [botCode, setBotCode] = useState('');
  const [tgSessionString, setTgSessionString] = useState('');
`;
admin = admin.replace(`const [codeRequested, setCodeRequested] = useState(false);`, missingState);
fs.writeFileSync('src/pages/Admin.tsx', admin);

// server.ts has BotDB definition lacking properties and `fs` not imported where it was used
let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(
    /type BotDB = \{[\s\S]*?\};/,
    `type BotDB = { users: Record<number, User>; history: any[]; withdrawals: any[]; topups: any[]; settings: any; tg_sessions: any; products: any };`
);
server = server.replace(
    `import cors from 'cors';`,
    `import cors from 'cors';\nimport fs from 'fs';`
);
fs.writeFileSync('server.ts', server);

