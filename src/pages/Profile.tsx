import { useState, useEffect } from 'react';
import { LogOut, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Modal, Input } from '../components/UI';
import { motion } from 'motion/react';

type Purchase = {
  purchaseId: number;
  country: string;
  price: number;
  date: string;
};

type Topup = {
  id: number;
  amountRub: number;
  currency: string;
  date: string;
};

export function Profile() {
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);

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
              <p className="text-white/50 text-sm mb-1">Баланс</p>
              <p className="font-medium text-3xl text-brand-purple">{user.balance.toFixed(2)} ₽</p>
            </div>
          </div>
        </motion.div>

        {/* Actions Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-glass border border-glass-border rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col justify-center space-y-4">
          <Button variant="secondary" onClick={() => window.open('https://t.me/your_support_acc', '_blank')} className="w-full py-4 text-lg">
            Поддержка
          </Button>
          <Button variant="danger" onClick={() => setLogoutModal(true)} className="w-full py-4 text-lg">
            Выйти из аккаунта
            <LogOut className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium mb-4">История покупок</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-white/50 text-sm text-center py-4">Загрузка...</p>
            ) : purchases.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">Нет покупок</p>
            ) : (
              purchases.map(p => (
                <div key={p.purchaseId} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="font-medium">{p.country}</p>
                    <p className="text-xs text-white/50">{new Date(p.date).toLocaleString()}</p>
                  </div>
                  <span className="font-medium text-brand-purple">-{p.price.toFixed(2)} ₽</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Topup History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium mb-4">История пополнений</h3>
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

      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)}>
        <div className="text-center space-y-6">
          <LogOut className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-xl font-medium">Выход</h3>
          <p className="text-white/70">Вы действительно хотите выйти?</p>
          <div className="flex gap-4 justify-center mt-6">
            <Button variant="secondary" onClick={() => setLogoutModal(false)} className="flex-1">Отмена</Button>
            <Button variant="danger" onClick={logout} className="flex-1">Выйти</Button>
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
