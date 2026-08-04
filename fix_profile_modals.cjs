const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const modalsJSX = `
      <Modal isOpen={promoModal} onClose={() => setPromoModal(false)} title="Активация промокода">
        <div className="space-y-4">
            <Input 
                placeholder="Введите код" 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value)} 
                className="text-center font-mono"
            />
            <Button className="w-full bg-brand-purple" onClick={async () => {
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
      </Modal>

      {promoSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-brand-purple/20 to-background-light border border-brand-purple/50 rounded-3xl p-8 w-full max-w-md text-center shadow-[0_0_50px_rgba(112,0,255,0.3)]">
            <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-3xl font-bold mb-2 text-white">Промокод активирован!</h3>
            <p className="text-5xl font-black text-brand-purple mb-6">+{promoSuccess.amount} ₽</p>
            <Button className="w-full bg-brand-purple py-4 text-lg shadow-lg shadow-brand-purple/25" onClick={() => setPromoSuccess(null)}>Отлично!</Button>
          </motion.div>
        </div>
      )}

      {codeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background-light border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white/70">Код авторизации</h3>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 cursor-pointer hover:bg-black/60 transition-colors" onClick={() => {
                navigator.clipboard.writeText(codeModal);
                toast.success('Код скопирован!');
            }}>
                <p className="text-5xl font-mono tracking-widest text-brand-purple font-black">{codeModal}</p>
                <p className="text-xs text-white/30 mt-4 uppercase tracking-wider">Нажмите, чтобы скопировать</p>
            </div>
            <Button className="w-full py-4 text-lg bg-white/5 hover:bg-white/10 text-white" onClick={() => setCodeModal(null)}>Закрыть</Button>
          </motion.div>
        </div>
      )}
`;

code = code.replace(/<Modal isOpen=\{logoutModal\}/, modalsJSX + "\n      <Modal isOpen={logoutModal}");

fs.writeFileSync('src/pages/Profile.tsx', code);
