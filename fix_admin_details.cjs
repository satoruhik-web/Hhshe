const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

const replacement = `
              <div className="space-y-4 pr-2">
                <div className="relative z-50">
                    <CountrySelect value={newProduct.country} onChange={v => setNewProduct({...newProduct, country: v})} placeholder="Страна (напр. Индонезия)" />
                </div>
                
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    {['MIX', 'Ручная'].map(reg => (
                        <button 
                            key={reg}
                            onClick={() => setNewProduct({...newProduct, registration: reg})}
                            className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors \${newProduct.registration === reg ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}\`}
                        >
                            {reg}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-1">2FA Облачный пароль</label>
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                        {['Да', 'Нет'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setNewProduct({...newProduct, twoFA: opt})}
                                className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors \${newProduct.twoFA === opt ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}\`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-1">Спам-блок</label>
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                        {['Да', 'Нет'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setNewProduct({...newProduct, spamBlock: opt})}
                                className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors \${newProduct.spamBlock === opt ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}\`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-1">ID (Количество цифр)</label>
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                        {[7, 8, 9, 10, 11].map(num => (
                            <button 
                                key={num}
                                onClick={() => setNewProduct({...newProduct, idDigits: num})}
                                className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors \${newProduct.idDigits === num ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}\`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                
                <Input placeholder="Цена в рублях" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
`;

code = code.replace(
    /<Input placeholder="Страна \(напр\. Индонезия\)" value=\{newProduct\.country\} onChange=\{e => setNewProduct\(\{\.\.\.newProduct, country: e\.target\.value\}\)\} \/>[\s\S]*?<Input placeholder="Цена в рублях" type="number" value=\{newProduct\.price\} onChange=\{e => setNewProduct\(\{\.\.\.newProduct, price: e\.target\.value\}\)\} \/>/,
    replacement.trim()
);

fs.writeFileSync('src/pages/Admin.tsx', code);
