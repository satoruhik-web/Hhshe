const fs = require('fs');

// 1. Add middleware to server.ts
let serverCode = fs.readFileSync('server.ts', 'utf-8');

const middleware = `
app.use('/api/admin', (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: No user ID provided' });
    }
    const user = db.users[parseInt(userId as string)];
    if (!user || !user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not an admin' });
    }
    next();
});
`;

serverCode = serverCode.replace(
    "app.use(express.json());",
    "app.use(express.json());\n" + middleware
);

// Add saveDB() to ensureAdmins()
serverCode = serverCode.replace(
    "        db.settings.adminIds.push(existing.id);\n    }\n  }",
    "        db.settings.adminIds.push(existing.id);\n    }\n  }\n  saveDB();"
);

fs.writeFileSync('server.ts', serverCode);

// 2. Update Admin.tsx to send the header
let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

adminCode = adminCode.replace(/import \{ useState, useEffect \} from 'react';/g, "import { useState, useEffect } from 'react';\nimport { useAuth } from '../context/AuthContext';");

adminCode = adminCode.replace(/export function Admin\(\) \{/g, "export function Admin() {\n  const { user } = useAuth();\n  \n  const fetchOptions = { headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) } };\n  const authHeaders = { 'x-user-id': String(user?.id) };");

// Replace fetch calls
adminCode = adminCode.replace(/fetch\('\/api\/admin\/stats'\)/g, "fetch('/api/admin/stats', { headers: authHeaders })");
adminCode = adminCode.replace(/fetch\('\/api\/admin\/products'\)/g, "fetch('/api/admin/products', { headers: authHeaders })");
adminCode = adminCode.replace(/fetch\('\/api\/admin\/users'\)/g, "fetch('/api/admin/users', { headers: authHeaders })");
adminCode = adminCode.replace(/fetch\('\/api\/admin\/promos'\)/g, "fetch('/api/admin/promos', { headers: authHeaders })");

adminCode = adminCode.replace(/headers: \{ 'Content-Type': 'application\/json' \}/g, "headers: fetchOptions.headers");
adminCode = adminCode.replace(/fetch\(\`\/api\/admin\/products\/\$\{id\}\`, \{ method: 'DELETE' \}\)/g, "fetch(`/api/admin/products/\${id}`, { method: 'DELETE', headers: authHeaders })");
adminCode = adminCode.replace(/fetch\('\/api\/admin\/promos\/' \+ p\.code, \{ method: 'DELETE' \}\)/g, "fetch('/api/admin/promos/' + p.code, { method: 'DELETE', headers: authHeaders })");

fs.writeFileSync('src/pages/Admin.tsx', adminCode);
