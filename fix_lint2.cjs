const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(
    /type User = \{[\s\S]*?\};/,
    `type User = { id: number; username: string; balance: number; isAdmin: boolean; isBlocked?: boolean; banReason?: string; bannedUntil?: number | null; ipAddress?: string; };`
);
fs.writeFileSync('server.ts', server);

