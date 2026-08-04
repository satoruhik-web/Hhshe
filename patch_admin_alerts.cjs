const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

if (!code.includes('sonner')) {
    code = code.replace(
        `import { useAuth } from '../context/AuthContext';`,
        `import { useAuth } from '../context/AuthContext';\nimport { toast } from 'sonner';`
    );
    
    // Replace all alert() with toast()
    code = code.replace(/alert\((.*)\)/g, (match, p1) => {
        if (p1.includes('Ошибка') || p1.includes('Не удалось')) {
            return `toast.error(${p1})`;
        }
        return `toast.success(${p1})`;
    });
}

// Add state for code
if (!code.includes('botCode')) {
    code = code.replace(
        `const [isAdding, setIsAdding] = useState(false);`,
        `const [isAdding, setIsAdding] = useState(false);\n  const [botCode, setBotCode] = useState('');\n  const [codeRequested, setCodeRequested] = useState(false);`
    );
    
    // Replace the bot session input area
    const botSessionArea = `
          {newProduct.hasBotSession && (
              <div className="space-y-4 border-l-2 border-brand-purple/50 pl-4 py-2">
                <Input placeholder="Номер телефона (+123456...)" value={newProduct.phone} onChange={e => setNewProduct({...newProduct, phone: e.target.value})} />
                
                {!codeRequested ? (
                    <Button variant="secondary" className="w-full py-2 text-sm" onClick={async () => {
                        try {
                            const res = await fetch('/api/admin/bot-session/request', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone: newProduct.phone })
                            });
                            const data = await res.json();
                            if(data.success) {
                                toast.success(data.message || 'Код отправлен');
                                setCodeRequested(true);
                            } else {
                                toast.error(data.message || 'Ошибка');
                            }
                        } catch(e) {
                            toast.error('Ошибка запроса кода');
                        }
                    }}>
                        Запросить код входа
                    </Button>
                ) : (
                    <div className="space-y-2">
                        <Input placeholder="Код из Telegram" value={botCode} onChange={e => setBotCode(e.target.value)} />
                        <Button className="w-full py-2 text-sm bg-brand-purple" onClick={async () => {
                            try {
                                const res = await fetch('/api/admin/bot-session/submit', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ phone: newProduct.phone, code: botCode })
                                });
                                const data = await res.json();
                                if(data.success) {
                                    toast.success('Сессия Telegram успешно сохранена!');
                                } else {
                                    toast.error(data.message || 'Неверный код');
                                }
                            } catch(e) {
                                toast.error('Ошибка проверки кода');
                            }
                        }}>
                            Подтвердить код
                        </Button>
                    </div>
                )}
              </div>
          )}`;
    
    // Find the existing bot session block to replace
    code = code.replace(
        /\{newProduct\.hasBotSession && \([\s\S]*?\}\)\]\} \/>\n              <\/div>\n          \)\}/,
        botSessionArea.trim()
    );
    // Since the regex might be tricky, let's just do a string replacement if possible
    // Wait, the block ends with "</div> )}". It's better to just do this with string replace.
}
fs.writeFileSync('src/pages/Admin.tsx', code);
