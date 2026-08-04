import { useState, useEffect } from 'react';
import { LogOut, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { Button, Modal, Input } from '../components/UI';
import { motion } from 'motion/react';

type Purchase = {
  purchaseId: number;
  productId: number;
  country: string;
  price: number;
  date: string;
  phone?: string;
  cloudPassword?: string;
  hasBotSession?: boolean;
};

type Topup = {
  id: number;
  amountRub: number;
  currency: string;
  date: string;
};

export function Profile() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [promoModal, setPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoSuccess, setPromoSuccess] = useState<any>(null);
  const [codeModal, setCodeModal] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [smsModal, setSmsModal] = useState(false);
  const [smsCodes, setSmsCodes] = useState<any[]>([]);
  const [isCheckingSms, setIsCheckingSms] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);

  
  
  const [purchaseCode, setPurchaseCode] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}/history`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPurchases(data.purchases);
            setTopups(data.topups);
          }
          setLoading(false);
        });
    }
  }, [user]);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!oldPassword || !newPassword) return setPasswordError("Заполните все поля");
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setPasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setPasswordSuccess(false);
        }, 1500);
      } else {
        setPasswordError(data.message);
      }
    } catch(e) {
      setPasswordError("Ошибка сервера");
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-end mb-4">
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value as any)}
          className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-brand-purple"
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="uk">Українська</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass border border-glass-border rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-[50px]" />
          <h2 className="text-xl font-medium mb-6">Информация</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-white/50 text-sm mb-1">Логин</p>
              <p className="font-medium text-lg">{user.username}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-white/50 text-sm">Пароль</p>
                <button onClick={() => setPasswordModal(true)} className="text-brand-purple text-xs hover:underline flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Сменить
                </button>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-medium text-lg font-mono">
                  {showPassword ? '••••••••' : '********'}
                </p>
                <button onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm mb-1">{t('balance')}</p>
              <p className="font-medium text-3xl text-brand-purple">{user.balance.toFixed(2)} ₽</p>
            </div>
          </div>
        </motion.div>


        {/* Actions Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-glass border border-glass-border rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col justify-center space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <Button variant="secondary" onClick={() => window.open('https://t.me/EmoRoman', '_blank')} className="w-full py-4 text-lg">
            {t('support')}
          </Button>
          <Button variant="danger" onClick={() => setLogoutModal(true)} className="w-full py-4 text-lg">
            {t('logout')}
            <LogOut className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium mb-4">{t('history_buy')}</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-white/50 text-sm text-center py-4">Загрузка...</p>
            ) : purchases.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">Нет покупок</p>
            ) : (
              purchases.map(p => (
                <div key={p.purchaseId} className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{p.country}</p>
                      <p className="text-xs text-white/50">{new Date(p.date).toLocaleString()}</p>
                    </div>
                    <span className="font-medium text-brand-purple">-{p.price.toFixed(2)} ₽</span>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 text-sm space-y-1">
                    <p><span className="text-white/50">Телефон:</span> {p.phone || 'Нет'}</p>
                    <p><span className="text-white/50">Облачный пароль:</span> {p.cloudPassword || 'Нет'}</p>
                  </div>
                  
                  {p.hasBotSession ? (
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                            <Button 
                                className="flex-1 text-xs py-2 bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30"
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/product/' + p.productId + '/request-code', { method: 'POST' });
                                        const data = await res.json();
                                        if (data.success) {
                                            setCodeModal(data.code);
                                        } else {
                                            toast.error(data.message || 'Ошибка');
                                        }
                                    } catch(e) {
                                        toast.error('Ошибка при получении кода');
                                    }
                                }}
                            >
                                Получить код
                            </Button>
                            <Button 
                                className="flex-1 text-xs py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                onClick={async () => {
                                    if(!confirm('Уверены? Бот больше не сможет получать коды для этого аккаунта.')) return;
                                    try {
                                        const res = await fetch('/api/product/' + p.productId + '/terminate-session', { method: 'POST' });
                                        if (res.ok) {
                                            setPurchases(purchases.map(item => item.purchaseId === p.purchaseId ? { ...item, hasBotSession: false } : item));
                                        }
                                    } catch(e) {}
                                }}
                            >
                                Удалить сессию бота
                            </Button>
                        
                            <Button 
                                className="flex-1 text-xs py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 mt-2 w-full"
                                onClick={() => {
                                    window.location.href = '/api/product/' + p.productId + '/tdata';
                                }}
                            >
                                Скачать TData
                            </Button>

                        </div>
                        {purchaseCode[p.purchaseId] && (
                            <div className="bg-brand-purple/10 text-brand-purple p-2 rounded text-center font-mono tracking-widest text-lg">
                                {purchaseCode[p.purchaseId]}
                            </div>
                        )}
                    </div>
                  ) : (
                      <p className="text-xs text-white/40 italic">Сессия бота удалена или недоступна</p>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Topup History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium mb-4">{t('history_topup')}</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-white/50 text-sm text-center py-4">Загрузка...</p>
            ) : topups.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">Нет пополнений</p>
            ) : (
              topups.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="font-medium">через {t.currency}</p>
                    <p className="text-xs text-white/50">{new Date(t.date).toLocaleString()}</p>
                  </div>
                  <span className="font-medium text-green-400">+{t.amountRub.toFixed(2)} ₽</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      
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

      
      <Modal isOpen={smsModal} onClose={() => setSmsModal(false)} title="СМС Коды">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {isCheckingSms && smsCodes.length === 0 && (
                <div className="text-center text-white/50 py-4">Проверка новых кодов...</div>
            )}
            {!isCheckingSms && smsCodes.length === 0 && (
                <div className="text-center text-white/50 py-4">Нет новых кодов</div>
            )}
            {smsCodes.map((sms, i) => {
                const daysOld = sms.buyTime ? Math.floor((Date.now() - new Date(sms.buyTime).getTime()) / (1000 * 60 * 60 * 24)) : 0;
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

      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)}>
        <div className="text-center space-y-6">
          <LogOut className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-xl font-medium">Выход</h3>
          <p className="text-white/70">Вы действительно хотите выйти?</p>
          <div className="flex gap-4 justify-center mt-6">
            <Button variant="secondary" onClick={() => setLogoutModal(false)} className="flex-1">Отмена</Button>
            <Button variant="danger" onClick={() => { setLogoutModal(false); setTimeout(() => logout(), 100); }} className="flex-1">Выйти</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)} title="Смена пароля">
        <div className="space-y-4">
          <Input type="password" placeholder="Старый пароль" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          <Input type="password" placeholder="Новый пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          
          {passwordError && <p className="text-red-400 text-sm text-center">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400 text-sm text-center">Пароль успешно изменен!</p>}
          
          <Button className="w-full mt-2" onClick={handleChangePassword}>Обновить пароль</Button>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
