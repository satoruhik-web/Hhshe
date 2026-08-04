const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// I'll completely remove the old Modal and replace it with my new HTML block directly.
// We need to look for <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Добавить товар (Аккаунт)">
const newModalCode = `
    {addModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto pt-20 pb-20">
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
                <Button variant="secondary" className="w-full mt-4" onClick={() => { setAddModal(false); }}>Отмена</Button>
              </div>
            )}

            {sessionStep === 'phone' && (
              <div className="space-y-4">
                <Input placeholder="Номер телефона (включая код страны, напр. +79...)" value={newProduct.phone} onChange={e => setNewProduct({...newProduct, phone: e.target.value})} />
                <div className="flex gap-4">
                    <Button variant="secondary" className="flex-1" onClick={() => { setAddModal(false); setSessionStep('initial'); }}>Отмена</Button>
                    <Button className="flex-1 bg-brand-purple" onClick={async () => {
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
              </div>
            )}

            {sessionStep === 'code' && (
              <div className="space-y-4">
                <Input placeholder="Код из Telegram" value={botCode} onChange={e => setBotCode(e.target.value)} />
                <div className="flex gap-4">
                    <Button variant="secondary" className="flex-1" onClick={() => { setAddModal(false); setSessionStep('initial'); }}>Отмена</Button>
                    <Button className="flex-1 bg-brand-purple" onClick={async () => {
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
              </div>
            )}

            {sessionStep === '2fa' && (
              <div className="space-y-4">
                <Input type="password" placeholder="Облачный пароль" value={newProduct.cloudPassword} onChange={e => setNewProduct({...newProduct, cloudPassword: e.target.value})} />
                <div className="flex gap-4">
                    <Button variant="secondary" className="flex-1" onClick={() => { setAddModal(false); setSessionStep('initial'); }}>Отмена</Button>
                    <Button className="flex-1 bg-brand-purple" onClick={async () => {
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
              </div>
            )}

            {sessionStep === 'details' && (
              <div className="space-y-4 pr-2">
                <Input placeholder="Страна (напр. Индонезия)" value={newProduct.country} onChange={e => setNewProduct({...newProduct, country: e.target.value})} />
                <Input placeholder="Регистрация (напр. MIX/Ручная)" value={newProduct.registration} onChange={e => setNewProduct({...newProduct, registration: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="2FA" value={newProduct.twoFA} onChange={e => setNewProduct({...newProduct, twoFA: e.target.value})} />
                  <Input placeholder="Спам-блок" value={newProduct.spamBlock} onChange={e => setNewProduct({...newProduct, spamBlock: e.target.value})} />
                </div>
                <Input placeholder="Кол-во цифр ID" type="number" value={newProduct.idDigits} onChange={e => setNewProduct({...newProduct, idDigits: parseInt(e.target.value) || 9})} />
                <Input placeholder="Цена в рублях" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                
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

code = code.replace(
    /<Modal isOpen=\{addModal\}[\s\S]*?(?=      <Modal isOpen=\{banModal\.isOpen\})/g,
    newModalCode
);

fs.writeFileSync('src/pages/Admin.tsx', code);
