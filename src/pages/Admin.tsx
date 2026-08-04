import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button, Input, Modal } from '../components/UI';
import { Plus, Trash2, Edit2, ShieldCheck, Users, DollarSign, Package, Key, Ban, Search, RefreshCw } from 'lucide-react';
import { CountrySelect } from '../components/CountrySelect';
import { cn } from '../lib/utils';

export function Admin() {
  const { user } = useAuth();
  const fetchOptions = { headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) } };
  const authHeaders = { 'x-user-id': String(user?.id) };
  const [stats, setStats] = useState({ productsCount: 0, usersCount: 0, profitToday: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [promosList, setPromosList] = useState<any[]>([]);
  const [viewPromoUsers, setViewPromoUsers] = useState<any>(null);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'codes' | 'review' | 'promos'>('products');

  const [addModal, setAddModal] = useState(false);
  const [sessionStep, setSessionStep] = useState<'initial' | 'phone' | 'code' | '2fa' | 'details'>('initial');
  const [botCode, setBotCode] = useState('');
  const [tgSessionString, setTgSessionString] = useState('');

  const [newProduct, setNewProduct] = useState({ 
    country: '', registration: '', twoFA: 'Да', spamBlock: 'Нет', price: '',
    hasBotSession: true, phone: '', cloudPassword: '', idDigits: 9
  });

  const [banModal, setBanModal] = useState<{isOpen: boolean, userId: number, username: string}>({isOpen: false, userId: 0, username: ''});
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('0'); // 0 = permanent

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, usersRes, promosRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: authHeaders }).then(r => r.json()),
        fetch('/api/admin/products', { headers: authHeaders }).then(r => r.json()),
        fetch('/api/admin/users', { headers: authHeaders }).then(r => r.json()),
        fetch('/api/admin/promos', { headers: authHeaders }).then(r => r.json())
      ]);
      if (statsRes) setStats(statsRes);
      if (prodRes.success) setProducts(prodRes.products);
      if (usersRes.success) setUsersList(usersRes.users);
      if (promosRes && promosRes.success) setPromosList(promosRes.promos);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: fetchOptions.headers,
        body: JSON.stringify({ 
          ...newProduct, 
          price: parseFloat(newProduct.price),
          idDigits: parseInt(newProduct.idDigits as any)
        })
      });
      if (res.ok) {
        setAddModal(false);
        setNewProduct({ country: '', registration: '', twoFA: 'Да', spamBlock: 'Нет', price: '', hasBotSession: true, phone: '', cloudPassword: '', idDigits: 9 });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: authHeaders });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBanUser = async () => {
    try {
        const durationMs = parseInt(banDuration);
        await fetch('/api/admin/ban', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: banModal.userId, reason: banReason, durationMs })
        });
        setBanModal({isOpen: false, userId: 0, username: ''});
        setBanReason('');
        fetchData();
    } catch (e) {
        console.error(e);
    }
  };
  
  const handleUnbanUser = async (userId: number) => {
    if(!confirm('Разблокировать пользователя?')) return;
    try {
        await fetch('/api/admin/unban', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId })
        });
        fetchData();
    } catch (e) {
        console.error(e);
    }
  };

  const handleEditPrice = async (id: number, newPrice: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: fetchOptions.headers,
        body: JSON.stringify({ price: newPrice })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleRestoreProduct = async (id: number) => {
      // Admin manual verify and restore
      try {
          await fetch(`/api/admin/products/${id}`, {
              method: 'PUT',
              headers: fetchOptions.headers,
              body: JSON.stringify({ status: 'active' })
          });
          fetchData();
      } catch (e) {
          console.error(e);
      }
  };

  if (!user?.isAdmin) return <div className="p-8 text-center text-red-400">Доступ запрещен</div>;

  const activeProducts = products.filter(p => p.status === 'active');
  const reviewProducts = products.filter(p => p.status === 'invalid_review');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Товаров в продаже</p>
            <p className="text-2xl font-medium">{stats.productsCount || 0}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Прибыль за сегодня</p>
            <p className="text-2xl font-medium">{stats.profitToday?.toFixed(2) || 0} ₽</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Пользователей</p>
            <p className="text-2xl font-medium">{stats.usersCount || 0}</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('products')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'products' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Товары
        </button>
        <button 
          onClick={() => setActiveTab('review')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'review' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          На проверке {reviewProducts.length > 0 && <span className="ml-2 bg-red-500/20 text-red-400 px-2 rounded-full text-xs">{reviewProducts.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'users' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Пользователи
        </button>
        <button 
          onClick={() => setActiveTab('codes')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'codes' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Коды пополнения
        </button>
        <button 
          onClick={() => setActiveTab('promos')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'promos' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Промокоды
        </button>
      </div>

      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => { setAddModal(true); setSessionStep('initial'); }}>
              <Plus className="w-5 h-5 mr-2" />
              Добавить товар
            </Button>
          </div>

          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-white/50 font-medium">ID</th>
                    <th className="p-6 text-white/50 font-medium">Инфо</th>
                    <th className="p-6 text-white/50 font-medium">Сессия бота</th>
                    <th className="p-6 text-white/50 font-medium">Цена</th>
                    <th className="p-6 text-right text-white/50 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Загрузка...</td></tr>
                  ) : activeProducts.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-white/50">Нет активных товаров</td></tr>
                  ) : activeProducts.map(p => (
                    <motion.tr 
                      key={p.id} 
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-6 text-white/50">#{p.id}</td>
                      <td className="p-6">
                        <div className="font-medium">{p.country}</div>
                        <div className="text-xs text-white/50">{p.registration}</div>
                      </td>
                      <td className="p-6">
                        {p.hasBotSession ? <span className="text-green-400 text-sm">Есть</span> : <span className="text-white/30 text-sm">Нет</span>}
                      </td>
                      <td className="p-6">
                        <input 
                          type="number" 
                          defaultValue={p.price} 
                          onBlur={(e) => handleEditPrice(p.id, parseFloat(e.target.value))}
                          className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 w-24 text-white focus:outline-none focus:border-brand-purple"
                        /> ₽
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleDeleteProduct(p.id)} 
                          title="Удалить товар"
                          className="p-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'review' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="text-white/50 text-sm">Здесь отображаются аккаунты, которые провалили проверку на валидность. Проверьте их и восстановите или удалите.</p>
          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-white/50 font-medium">ID / Страна</th>
                    <th className="p-6 text-white/50 font-medium">Телефон</th>
                    <th className="p-6 text-right text-white/50 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="p-8 text-center">Загрузка...</td></tr>
                  ) : reviewProducts.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-white/50">Нет товаров на проверке</td></tr>
                  ) : reviewProducts.map(p => (
                    <motion.tr 
                      key={p.id} 
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-6">
                        <div className="font-medium">#{p.id}</div>
                        <div className="text-xs text-white/50">{p.country}</div>
                      </td>
                      <td className="p-6 font-mono text-sm">{p.phone}</td>
                      <td className="p-6 text-right space-x-2 flex justify-end gap-2">
                        <Button onClick={() => handleRestoreProduct(p.id)} className="py-2">
                           <RefreshCw className="w-4 h-4 mr-2" />
                           Выставить снова
                        </Button>
                        <Button variant="secondary" onClick={() => handleDeleteProduct(p.id)} className="py-2 text-red-400">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'codes' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={async () => {
                const amount = prompt('Введите сумму пополнения (₽):');
                if (!amount || isNaN(parseFloat(amount))) return;
                try {
                    const res = await fetch('/api/admin/topup-code', {
                        method: 'POST',
                        headers: fetchOptions.headers,
                        body: JSON.stringify({ amount: parseFloat(amount) })
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Сгенерирован код:\n' + data.code);
                    }
                } catch(e) {
                    console.error(e);
                }
            }}>
              <Key className="w-5 h-5 mr-2" />
              Создать код
            </Button>
          </div>
          <p className="text-white/50 text-sm">Передайте код пользователю для пополнения баланса.</p>
        </motion.div>
      )}

      
      {activeTab === 'promos' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={() => {
                const code = prompt('Код (оставьте пустым для генерации):');
                const amount = prompt('Сумма (₽):');
                if (!amount) return;
                const maxUses = prompt('Количество использований (оставьте пустым если бесконечно):');
                const hideAdmin = confirm('Скрыть создателя промокода от пользователей?');
                
                fetch('/api/admin/promos', {
                    method: 'POST',
                    headers: fetchOptions.headers,
                    body: JSON.stringify({ 
                        code: code || Math.random().toString(36).substring(2, 10).toUpperCase(), 
                        amount, 
                        maxUses: maxUses || null,
                        hideAdmin
                    })
                }).then(() => fetchData());
            }}>Создать промокод</Button>
          </div>
          
          <div className="bg-glass border border-glass-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="p-4 text-white/50">Код</th>
                        <th className="p-4 text-white/50">Сумма</th>
                        <th className="p-4 text-white/50">Использования</th>
                        <th className="p-4 text-white/50">Создатель</th>
                        <th className="p-4 text-white/50 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
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
                </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-4">
            <Input 
                placeholder="Поиск по ID, Юзернейму или Телефону..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="max-w-md"
            />
          </div>
          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-white/50 font-medium">ID</th>
                    <th className="p-6 text-white/50 font-medium">Пользователь</th>
                    <th className="p-6 text-white/50 font-medium">Телефон</th>
                    <th className="p-6 text-white/50 font-medium">IP Адрес</th>
                    <th className="p-6 text-white/50 font-medium">Баланс</th>
                    <th className="p-6 text-white/50 font-medium">Статус</th>
                    <th className="p-6 text-right text-white/50 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center">Загрузка...</td></tr>
                  ) : usersList.filter(u => u.id.toString().includes(userSearch) || (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.phone || '').includes(userSearch)).map(u => (
                    <motion.tr 
                      key={u.id} 
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-6 text-white/50">#{u.id}</td>
                      <td className="p-6">
                        {u.username || u.phone || 'Без имени'} 
                        {u.isAdmin && <span className="ml-2 text-xs bg-brand-purple/20 text-brand-purple px-2 py-1 rounded-md">Админ</span>}
                      </td>
                      <td className="p-6 font-mono text-sm text-white/70">{u.ipAddress || 'Неизвестно'}</td>
                      <td className="p-6">{u.balance.toFixed(2)} ₽</td>
                      <td className="p-6">
                          {u.isBlocked ? (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-md">Забанен</span>
                          ) : (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-md">Активен</span>
                          )}
                      </td>
                      <td className="p-6 text-right space-x-2">
                        {!u.isAdmin && (
                          <>
                            {u.isBlocked ? (
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleUnbanUser(u.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors inline-block" title="Разбанить">
                                  <ShieldCheck className="w-5 h-5" />
                                </motion.button>
                            ) : (
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setBanModal({isOpen: true, userId: u.id, username: u.username || 'Пользователь'})} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block" title="Забанить">
                                  <Ban className="w-5 h-5" />
                                </motion.button>
                            )}
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      
    
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
                                headers: fetchOptions.headers,
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
                                headers: fetchOptions.headers,
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
                                headers: fetchOptions.headers,
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
                  <div className="relative z-50">
                    <CountrySelect value={newProduct.country} onChange={v => setNewProduct({...newProduct, country: v})} placeholder="Страна (напр. Индонезия)" />
                </div>
                
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    {['MIX', 'Ручная'].map(reg => (
                        <button 
                            key={reg}
                            onClick={() => setNewProduct({...newProduct, registration: reg})}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${newProduct.registration === reg ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
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
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${newProduct.twoFA === opt ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
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
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${newProduct.spamBlock === opt ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
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
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${newProduct.idDigits === num ? 'bg-brand-purple text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                
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
                              headers: fetchOptions.headers,
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
      <Modal isOpen={banModal.isOpen} onClose={() => setBanModal({isOpen: false, userId: 0, username: ''})} title={`Блокировка ${banModal.username}`}>
        <div className="space-y-4">
            <Input placeholder="Причина блокировки" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
            <select 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-purple text-white" 
                value={banDuration} 
                onChange={e => setBanDuration(e.target.value)}
            >
                <option value="0">Навсегда</option>
                <option value="86400000">На 1 день</option>
                <option value="604800000">На 1 неделю</option>
                <option value="2592000000">На 1 месяц</option>
            </select>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={handleBanUser}>
                Заблокировать по IP
            </Button>
        </div>
      </Modal>

    </div>
  );
}
