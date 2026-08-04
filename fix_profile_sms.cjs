const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Add states
code = code.replace(
    /const \[passwordModal, setPasswordModal\] = useState\(false\);/,
    "const [passwordModal, setPasswordModal] = useState(false);\n  const [smsModal, setSmsModal] = useState(false);\n  const [smsCodes, setSmsCodes] = useState<any[]>([]);\n  const [isCheckingSms, setIsCheckingSms] = useState(false);"
);

// Add useEffect to fetch SMS on load
code = code.replace(
    /useEffect\(\(\) => \{\n    if \(!user\) navigate\('\/'\);\n  \}, \[user, navigate\]\);/,
    `useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const fetchSms = async () => {
        if (!user) return;
        setIsCheckingSms(true);
        try {
            const res = await fetch('/api/user/codes', {
                headers: { 'x-user-id': user.id.toString() }
            });
            const data = await res.json();
            if (data.success) {
                setSmsCodes(data.codes);
            }
        } catch(e) {}
        setIsCheckingSms(false);
    };
    fetchSms();
    const interval = setInterval(fetchSms, 30000);
    return () => clearInterval(interval);
  }, [user]);`
);

// Add SMS Button
const actionsCardRegex = /<Button variant="secondary" onClick=\{([^}]+)\} className="w-full py-4 text-lg">\s*Ввести промокод\s*<\/Button>/;
code = code.replace(
    actionsCardRegex,
    `<div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={() => setPromoModal(true)} className="w-full py-4 text-lg">
                Промокод
            </Button>
            <Button variant="secondary" onClick={() => setSmsModal(true)} className="w-full py-4 text-lg relative">
                СМС
                {smsCodes.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {smsCodes.length}
                    </span>
                )}
            </Button>
          </div>`
);

// Add SMS Modal
const smsModalJSX = `
      <Modal isOpen={smsModal} onClose={() => setSmsModal(false)} title="СМС Коды">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {isCheckingSms && smsCodes.length === 0 && (
                <div className="text-center text-white/50 py-4">Проверка новых кодов...</div>
            )}
            {!isCheckingSms && smsCodes.length === 0 && (
                <div className="text-center text-white/50 py-4">Нет новых кодов</div>
            )}
            {smsCodes.map((sms, i) => {
                const daysOld = Math.floor((Date.now() - new Date(sms.buyTime).getTime()) / (1000 * 60 * 60 * 24));
                return (
                <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-white">ID: {sms.productId}</p>
                            <p className="text-sm text-white/50">{sms.country} • {sms.phone || 'Нет номера'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-brand-purple bg-brand-purple/20 px-2 py-1 rounded-lg">Новый код</p>
                        </div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                        <p className="text-3xl font-mono text-center tracking-widest text-brand-purple font-black">{sms.code}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
                        <div className="bg-white/5 p-2 rounded-lg text-center">Куплен: {daysOld} дн. назад</div>
                        <div className="bg-white/5 p-2 rounded-lg text-center">Бот активен</div>
                    </div>
                    <Button 
                        variant="secondary" 
                        className="w-full text-xs py-2 bg-white/5 hover:bg-white/10"
                        onClick={async () => {
                            toast.loading('Запрос нового кода...', { id: 'req_code' });
                            try {
                                const res = await fetch('/api/product/' + sms.productId + '/request-code', { method: 'POST' });
                                const data = await res.json();
                                if (data.success) {
                                    toast.success('Новый код отправлен!', { id: 'req_code' });
                                } else {
                                    toast.error(data.message || 'Ошибка', { id: 'req_code' });
                                }
                            } catch(e) {
                                toast.error('Ошибка', { id: 'req_code' });
                            }
                        }}
                    >
                        Запросить новый код
                    </Button>
                </div>
            )})}
        </div>
      </Modal>
`;

code = code.replace(/<Modal isOpen=\{logoutModal\}/, smsModalJSX + "\n      <Modal isOpen={logoutModal}");

fs.writeFileSync('src/pages/Profile.tsx', code);
