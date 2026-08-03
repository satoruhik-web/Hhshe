import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Modal } from '../components/UI';
import { Plus, Trash2, Edit2, ShieldCheck, Users, DollarSign, Package } from 'lucide-react';
import { cn } from '../lib/utils';

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ productsCount: 0, usersCount: 0, profitToday: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');

  const [addModal, setAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ country: '', registration: '', twoFA: 'Да', spamBlock: 'Нет', price: '' });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json())
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setProducts(prodRes.products);
      if (usersRes.success) setUsersList(usersRes.users);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) })
      });
      if (res.ok) {
        setAddModal(false);
        setNewProduct({ country: '', registration: '', twoFA: 'Да', spamBlock: 'Нет', price: '' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckValidity = async () => {
    try {
      const res = await fetch('/api/admin/check-validity', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditPrice = async (id: number, newPrice: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user?.isAdmin) return <div className="p-8 text-center text-red-400">Доступ запрещен</div>;

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
            <p className="text-2xl font-medium">{stats.productsCount}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Прибыль за сегодня</p>
            <p className="text-2xl font-medium">{stats.profitToday.toFixed(2)} ₽</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Пользователей</p>
            <p className="text-2xl font-medium">{stats.usersCount}</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('products')} 
          className={cn("px-4 py-2 font-medium transition-colors", activeTab === 'products' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Товары
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={cn("px-4 py-2 font-medium transition-colors", activeTab === 'users' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Пользователи
        </button>
      </div>

      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setAddModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Добавить товар
            </Button>
            <Button variant="secondary" onClick={handleCheckValidity}>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Проверить на невалид
            </Button>
          </div>

          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-white/50 font-medium">ID</th>
                    <th className="p-6 text-white/50 font-medium">Страна</th>
                    <th className="p-6 text-white/50 font-medium">Цена</th>
                    <th className="p-6 text-right text-white/50 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center">Загрузка...</td></tr>
                  ) : products.map(p => (
                    <motion.tr 
                      key={p.id} 
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-6 text-white/50">#{p.id}</td>
                      <td className="p-6">{p.country}</td>
                      <td className="p-6">
                        <input 
                          type="number" 
                          defaultValue={p.price} 
                          onBlur={(e) => handleEditPrice(p.id, parseFloat(e.target.value))}
                          className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 w-24 text-white focus:outline-none focus:border-brand-purple"
                        /> ₽
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block">
                          <Trash2 className="w-5 h-5" />
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

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-white/50 font-medium">ID</th>
                    <th className="p-6 text-white/50 font-medium">Пользователь</th>
                    <th className="p-6 text-white/50 font-medium">Баланс</th>
                    <th className="p-6 text-right text-white/50 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center">Загрузка...</td></tr>
                  ) : usersList.map(u => (
                    <motion.tr 
                      key={u.id} 
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-6 text-white/50">#{u.id}</td>
                      <td className="p-6">
                        {u.username} 
                        {u.isAdmin && <span className="ml-2 text-xs bg-brand-purple/20 text-brand-purple px-2 py-1 rounded-md">Админ</span>}
                      </td>
                      <td className="p-6">{u.balance.toFixed(2)} ₽</td>
                      <td className="p-6 text-right space-x-2">
                        {!u.isAdmin && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block">
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
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

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Добавить товар">
        <div className="space-y-4">
          <Input placeholder="Страна" value={newProduct.country} onChange={e => setNewProduct({...newProduct, country: e.target.value})} />
          <Input placeholder="Год регистрации" value={newProduct.registration} onChange={e => setNewProduct({...newProduct, registration: e.target.value})} />
          <div className="flex gap-4">
            <select className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-purple text-white" value={newProduct.twoFA} onChange={e => setNewProduct({...newProduct, twoFA: e.target.value})}>
              <option value="Да">2FA: Да</option>
              <option value="Нет">2FA: Нет</option>
            </select>
            <select className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-purple text-white" value={newProduct.spamBlock} onChange={e => setNewProduct({...newProduct, spamBlock: e.target.value})}>
              <option value="Да">Спам: Да</option>
              <option value="Нет">Спам: Нет</option>
            </select>
          </div>
          <Input type="number" placeholder="Цена (₽)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <Button className="w-full mt-4" onClick={handleAddProduct}>Сохранить</Button>
        </div>
      </Modal>

    </div>
  );
}
