const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Modals state
code = code.replace(
    "const [logoutModal, setLogoutModal] = useState(false);",
    "const [logoutModal, setLogoutModal] = useState(false);\n  const [promoModal, setPromoModal] = useState(false);\n  const [promoCode, setPromoCode] = useState('');\n  const [promoSuccess, setPromoSuccess] = useState<any>(null);"
);

// Add button
code = code.replace(
    /<Button variant="secondary" onClick=\{\(\) => window.open\('https:\/\/t.me\/EmoRoman', '_blank'\)\} className="w-full py-4 text-lg">/g,
    `<Button variant="secondary" onClick={() => setPromoModal(true)} className="w-full py-4 text-lg">
            Ввести промокод
          </Button>
          <Button variant="secondary" onClick={() => window.open('https://t.me/EmoRoman', '_blank')} className="w-full py-4 text-lg">`
);

// Add modal JSX
const promoModals = `
      {promoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background-light border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4 text-white">Активация промокода</h3>
            <Input 
                placeholder="Введите код" 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value)} 
                className="mb-4 text-center font-mono"
            />
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={() => setPromoModal(false)}>Отмена</Button>
              <Button className="flex-1 bg-brand-purple" onClick={async () => {
                  try {
                      const res = await fetch('/api/promo/use', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user.id, code: promoCode })
                      });
                      const data = await res.json();
                      if (data.success) {
                          setPromoModal(false);
                          setPromoCode('');
                          setPromoSuccess({ amount: data.amount, createdBy: data.createdBy, time: new Date().toLocaleTimeString() });
                          useStore.getState().login({ ...user, balance: data.newBalance });
                      } else {
                          toast.error(data.message || 'Ошибка');
                      }
                  } catch(e) {}
              }}>Активировать</Button>
            </div>
          </motion.div>
        </div>
      )}

      {promoSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-brand-purple/20 to-background-light border border-brand-purple/50 rounded-3xl p-8 w-full max-w-md text-center shadow-[0_0_50px_rgba(112,0,255,0.3)]">
            <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-3xl font-bold mb-2 text-white">Промокод активирован!</h3>
            <p className="text-5xl font-black text-brand-purple mb-6">+{promoSuccess.amount} ₽</p>
            
            <div className="bg-black/20 rounded-xl p-4 mb-8 text-left space-y-2 text-sm text-white/70">
                <div className="flex justify-between">
                    <span>Время активации:</span>
                    <span className="text-white">{promoSuccess.time}</span>
                </div>
                {promoSuccess.createdBy && (
                    <div className="flex justify-between">
                        <span>Выдал администратор:</span>
                        <span className="text-brand-purple font-medium">{promoSuccess.createdBy}</span>
                    </div>
                )}
            </div>
            
            <Button className="w-full bg-brand-purple py-4 text-lg shadow-lg shadow-brand-purple/25" onClick={() => setPromoSuccess(null)}>Отлично!</Button>
          </motion.div>
        </div>
      )}
`;

code = code.replace(/\{logoutModal && \(/, promoModals + "\n      {logoutModal && (");

fs.writeFileSync('src/pages/Profile.tsx', code);
