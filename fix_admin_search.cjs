const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Add search state
code = code.replace(
    "const [promosList, setPromosList] = useState<any[]>([]);",
    "const [promosList, setPromosList] = useState<any[]>([]);\n  const [userSearch, setUserSearch] = useState('');"
);

// Add search input in the UI
const searchUI = `
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-4">
            <Input 
                placeholder="Поиск по ID, Юзернейму или Телефону..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="max-w-md"
            />
          </div>
          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
`;

code = code.replace(
    /<motion\.div initial=\{\{ opacity: 0, y: 10 \}\} animate=\{\{ opacity: 1, y: 0 \}\} className="space-y-6">\s*<div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">/,
    searchUI
);

// Filter usersList
code = code.replace(
    /usersList\.map\(u => \(/,
    "usersList.filter(u => u.id.toString().includes(userSearch) || (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.phone || '').includes(userSearch)).map(u => ("
);

// Update table headers and row to show all 3 (ID, Username, Phone)
code = code.replace(
    /<th className="p-6 text-white\/50 font-medium">Пользователь<\/th>/,
    '<th className="p-6 text-white/50 font-medium">Пользователь</th>\n                    <th className="p-6 text-white/50 font-medium">Телефон</th>'
);

code = code.replace(
    /<td className="p-6 text-white font-medium">\{u\.username \|\| 'Аноним'\}<\/td>/,
    `<td className="p-6 text-white font-medium">
                        <div className="flex flex-col">
                            <span>{u.username || 'Аноним'}</span>
                            {u.first_name && <span className="text-xs text-white/50">{u.first_name}</span>}
                        </div>
                    </td>
                    <td className="p-6 text-white/70">{u.phone || '—'}</td>`
);


fs.writeFileSync('src/pages/Admin.tsx', code);
