const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Add viewPromo state
code = code.replace(
    "const [promosList, setPromosList] = useState<any[]>([]);",
    "const [promosList, setPromosList] = useState<any[]>([]);\n  const [viewPromoUsers, setViewPromoUsers] = useState<any>(null);"
);

// Add usersList to viewPromoUsers
const tableContent = `
                    {promosList.map(p => (
                        <tr key={p.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono">{p.code}</td>
                            <td className="p-4 text-green-400">+{p.amount} ₽</td>
                            <td className="p-4">
                                <span className="font-medium">{p.uses}</span> / {p.maxUses || '∞'}
                            </td>
                            <td className="p-4">{p.hideAdmin ? 'Скрыто' : p.createdBy}</td>
                            <td className="p-4 text-right space-x-2">
                                <Button variant="secondary" className="text-brand-purple hover:bg-brand-purple hover:text-white" onClick={() => {
                                    setViewPromoUsers({
                                        code: p.code,
                                        usedBy: p.usedBy || []
                                    });
                                }}>Использования ({p.uses})</Button>
                                <Button variant="secondary" className="text-red-400 hover:text-red-300" onClick={() => {
                                    if(confirm('Удалить?')) {
                                        fetch('/api/admin/promos/' + p.code, { method: 'DELETE', headers: authHeaders }).then(() => fetchData());
                                    }
                                }}>Удалить</Button>
                            </td>
                        </tr>
                    ))}
`;

code = code.replace(/\{promosList\.map\(p => \([\s\S]*?\)\)\}/, tableContent.trim());

const viewModalJSX = `
      {viewPromoUsers && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background-light border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-white flex justify-between items-center">
                <span>Использования кода: <span className="text-brand-purple font-mono">{viewPromoUsers.code}</span></span>
            </h3>
            
            <div className="space-y-2">
                {viewPromoUsers.usedBy.length === 0 ? (
                    <p className="text-white/50 text-center py-4">Еще никто не использовал</p>
                ) : (
                    viewPromoUsers.usedBy.map((use: any, idx: number) => {
                        const u = usersList.find(x => x.id === use.userId);
                        return (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">{u?.username || 'ID ' + use.userId}</span>
                                    {u?.phone && <span className="text-xs text-white/50">{u.phone}</span>}
                                </div>
                                <span className="text-sm text-white/40">{new Date(use.usedAt).toLocaleString()}</span>
                            </div>
                        )
                    })
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
                <Button className="w-full" variant="secondary" onClick={() => setViewPromoUsers(null)}>Закрыть</Button>
            </div>
          </motion.div>
        </div>
      )}
`;

code = code.replace(/\{addModal && \(/, viewModalJSX + "\n      {addModal && (");

fs.writeFileSync('src/pages/Admin.tsx', code);
