const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Add promosList state
code = code.replace(
    "const [usersList, setUsersList] = useState<any[]>([]);",
    "const [usersList, setUsersList] = useState<any[]>([]);\n  const [promosList, setPromosList] = useState<any[]>([]);"
);

// Add promos fetch
code = code.replace(
    /fetch\('\/api\/admin\/users'\)\.then\(r => r\.json\(\)\)/,
    "fetch('/api/admin/users').then(r => r.json()),\n        fetch('/api/admin/promos').then(r => r.json())"
);
code = code.replace(
    /const \[statsRes, prodRes, usersRes\] = await Promise\.all\(\[/,
    "const [statsRes, prodRes, usersRes, promosRes] = await Promise.all(["
);
code = code.replace(
    /if \(usersRes\.success\) setUsersList\(usersRes\.users\);/,
    "if (usersRes.success) setUsersList(usersRes.users);\n      if (promosRes && promosRes.success) setPromosList(promosRes.promos);"
);

// Add promos tab content
const promoContent = `
      {activeTab === 'promos' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={() => {
                const code = prompt('Код (оставьте пустым для генерации):');
                const amount = prompt('Сумма (₽):');
                if (!amount) return;
                const maxUses = prompt('Количество использований (оставьте пустым если бесконечно):');
                const hideAdmin = confirm('Скрыть создателя промокода от пользователей?');
                
                fetch('/api/admin/promos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: code || Math.random().toString(36).substring(2, 10).toUpperCase(), 
                        amount, 
                        maxUses: maxUses || null,
                        hideAdmin
                    })
                }).then(() => fetchData());
            }}>Создать промокод</Button>
          </div>
          
          <div className="bg-glass border border-glass-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="p-4 text-white/50">Код</th>
                        <th className="p-4 text-white/50">Сумма</th>
                        <th className="p-4 text-white/50">Использования</th>
                        <th className="p-4 text-white/50">Создатель</th>
                        <th className="p-4 text-white/50 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {promosList.map(p => (
                        <tr key={p.code} className="border-b border-white/5">
                            <td className="p-4 font-mono">{p.code}</td>
                            <td className="p-4 text-green-400">+{p.amount} ₽</td>
                            <td className="p-4">{p.uses} / {p.maxUses || '∞'}</td>
                            <td className="p-4">{p.hideAdmin ? 'Скрыто' : p.createdBy}</td>
                            <td className="p-4 text-right">
                                <Button variant="secondary" className="text-red-400 hover:text-red-300" onClick={() => {
                                    if(confirm('Удалить?')) {
                                        fetch('/api/admin/promos/' + p.code, { method: 'DELETE' }).then(() => fetchData());
                                    }
                                }}>Удалить</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </motion.div>
      )}
`;

code = code.replace(/\{activeTab === 'users' && \(/, promoContent + "\n      {activeTab === 'users' && (");

fs.writeFileSync('src/pages/Admin.tsx', code);
