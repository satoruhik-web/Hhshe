const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// We need to implement a complex flow for adding products:
// 1. Choose with/without session
// 2. If with session:
//    a. Input phone -> Request Code
//    b. Input code -> Submit Code -> (check if needs 2FA or success)
//    c. If needs 2FA -> Input password -> Submit 2FA -> success
//    d. Then input other details (country, price, etc.) and save
// 3. If without session, just input details and save

const stepCode = `
  const [sessionStep, setSessionStep] = useState<'initial' | 'phone' | 'code' | '2fa' | 'details'>('initial');
  const [tgSessionString, setTgSessionString] = useState('');
`;
code = code.replace(
  `const [codeRequested, setCodeRequested] = useState(false);`,
  `const [codeRequested, setCodeRequested] = useState(false);\n${stepCode}`
);

const newModalCode = `
      {addModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] rounded-2xl p-6 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold">Добавить аккаунт</h3>
            
            {sessionStep === 'initial' && (
              <div className="space-y-4">
                <Button className="w-full bg-brand-purple py-6" onClick={() => { setNewProduct({...newProduct, hasBotSession: true}); setSessionStep('phone'); }}>
                  С сессией бота (Автовыдача кодов)
                </Button>
                <Button className="w-full bg-[#2a2b2e] hover:bg-[#3a3b3e] py-6" onClick={() => { setNewProduct({...newProduct, hasBotSession: false}); setSessionStep('details'); }}>
                  Без сессии бота (Обычный товар)
                </Button>
              </div>
            )}

            {sessionStep === 'phone' && (
              <div className="space-y-4">
                <Input placeholder="Номер телефона (включая код страны, напр. +79...)" value={newProduct.phone} onChange={e => setNewProduct({...newProduct, phone: e.target.value})} />
                <Button className="w-full" onClick={async () => {
                    try {
                        const res = await fetch('/api/admin/bot-session/request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: newProduct.phone })
                        });
                        const data = await res.json();
                        if(data.success) {
                            toast.success('Код отправлен в Telegram');
                            setSessionStep('code');
                        } else {
                            toast.error(data.message || 'Ошибка');
                        }
                    } catch(e) {
                        toast.error('Ошибка запроса');
                    }
                }}>Отправить код</Button>
              </div>
            )}

            {sessionStep === 'code' && (
              <div className="space-y-4">
                <Input placeholder="Код из Telegram" value={botCode} onChange={e => setBotCode(e.target.value)} />
                <Button className="w-full" onClick={async () => {
                    try {
                        const res = await fetch('/api/admin/bot-session/submit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: newProduct.phone, code: botCode })
                        });
                        const data = await res.json();
                        if (data.success) {
                            toast.success('Успешный вход в аккаунт');
                            setTgSessionString(data.session_string);
                            setSessionStep('details');
                        } else if (data.needs_2fa) {
                            toast.info('Требуется облачный пароль (2FA)');
                            setSessionStep('2fa');
                        } else {
                            toast.error(data.message || 'Ошибка');
                        }
                    } catch(e) {
                        toast.error('Ошибка запроса');
                    }
                }}>Проверить код</Button>
              </div>
            )}

            {sessionStep === '2fa' && (
              <div className="space-y-4">
                <Input type="password" placeholder="Облачный пароль" value={newProduct.cloudPassword} onChange={e => setNewProduct({...newProduct, cloudPassword: e.target.value})} />
                <Button className="w-full" onClick={async () => {
                    try {
                        const res = await fetch('/api/admin/bot-session/submit-2fa', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: newProduct.phone, password: newProduct.cloudPassword })
                        });
                        const data = await res.json();
                        if (data.success) {
                            toast.success('Успешный вход с 2FA');
                            setTgSessionString(data.session_string);
                            setSessionStep('details');
                        } else {
                            toast.error(data.message || 'Неверный пароль');
                        }
                    } catch(e) {
                        toast.error('Ошибка запроса');
                    }
                }}>Войти</Button>
              </div>
            )}

            {sessionStep === 'details' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <Input placeholder="Страна (напр. Индонезия)" value={newProduct.country} onChange={e => setNewProduct({...newProduct, country: e.target.value})} />
                <Input placeholder="Регистрация (напр. MIX/Ручная)" value={newProduct.registration} onChange={e => setNewProduct({...newProduct, registration: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="2FA" value={newProduct.twoFA} onChange={e => setNewProduct({...newProduct, twoFA: e.target.value})} />
                  <Input placeholder="Спам-блок" value={newProduct.spamBlock} onChange={e => setNewProduct({...newProduct, spamBlock: e.target.value})} />
                </div>
                <Input placeholder="Цена в рублях" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                
                {/* Add standard login details if no bot session */}
                {!newProduct.hasBotSession && (
                    <div className="space-y-2 border-t border-white/10 pt-4 mt-4">
                        <p className="text-sm text-gray-400 mb-2">Данные для выдачи при покупке</p>
                        <Input placeholder="Номер телефона" value={newProduct.phone} onChange={e => setNewProduct({...newProduct, phone: e.target.value})} />
                        <Input placeholder="Облачный пароль (если есть)" value={newProduct.cloudPassword} onChange={e => setNewProduct({...newProduct, cloudPassword: e.target.value})} />
                    </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => { setAddModal(false); setSessionStep('initial'); }}>Отмена</Button>
                  <Button className="flex-1 bg-brand-purple" onClick={async () => {
                      try {
                          const res = await fetch('/api/admin/products', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                ...newProduct, 
                                price: parseFloat(newProduct.price),
                                idDigits: parseInt(newProduct.idDigits as any),
                                tgSessionString: tgSessionString
                              })
                          });
                          if (res.ok) {
                              setAddModal(false);
                              setSessionStep('initial');
                              setTgSessionString('');
                              setNewProduct({ country: '', registration: '', twoFA: 'Да', spamBlock: 'Нет', price: '', hasBotSession: true, phone: '', cloudPassword: '', idDigits: 9 });
                              fetchData();
                              toast.success('Товар добавлен');
                          }
                      } catch (e) {
                          toast.error('Ошибка добавления товара');
                      }
                  }}>Сохранить</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
`;

// Replace the existing add modal block
code = code.replace(
    /\{addModal && \([\s\S]*?\}\)\]\} \/>\n              <\/div>\n          \)\}[\s\S]*?<\/div>\n        <\/div>\n      \)\}/,
    newModalCode.trim()
);

fs.writeFileSync('src/pages/Admin.tsx', code);
