const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Remove double import of useAuth
code = code.replace(/import \{ useAuth \} from '\.\.\/context\/AuthContext';\nimport \{ motion, AnimatePresence \} from 'motion\/react';\nimport \{ useAuth \} from '\.\.\/context\/AuthContext';/, "import { useAuth } from '../context/AuthContext';\nimport { motion, AnimatePresence } from 'motion/react';");

// Remove double declaration of const { user } = useAuth();
code = code.replace(/  const \{ user \} = useAuth\(\);\n  \n  const fetchOptions = \{ headers: \{ 'Content-Type': 'application\/json', 'x-user-id': String\(user\?\.id\) \} \};\n  const authHeaders = \{ 'x-user-id': String\(user\?\.id\) \};\n  const \{ user \} = useAuth\(\);/, "  const { user } = useAuth();\n  const fetchOptions = { headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) } };\n  const authHeaders = { 'x-user-id': String(user?.id) };");

fs.writeFileSync('src/pages/Admin.tsx', code);
