import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button, Modal } from '../components/UI';
import { CountrySelect } from '../components/CountrySelect';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Product = {
  id: number;
  country: string;
  registration: string;
  twoFA: string;
  spamBlock: string;
  price: number;
  idDigits?: number;
  addedDate?: number;
  hasBotSession?: boolean;
};

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'checking' | 'processing' | 'success' | 'error'>('idle');
  const [buyError, setBuyError] = useState('');

  const { user, updateBalance } = useAuth();
  const [filterCountry, setFilterCountry] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setBuyStatus('idle');
    setBuyError('');
    setBuyModalOpen(true);
  };

  const confirmBuy = async () => {
    if (!selectedProduct || !user) return;
    
    setBuyStatus('checking');
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBuyStatus('processing');

    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: selectedProduct.id })
      });
      const data = await res.json();
      
      if (data.success) {
        updateBalance(data.balance);
        setBuyStatus('success');
        fetchProducts(); // refresh catalog
      } else {
        setBuyError(data.message);
        setBuyStatus('error');
        fetchProducts(); // it might have been removed
      }
    } catch (err) {
      setBuyError('Ошибка соединения');
      setBuyStatus('error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Filters */}
      <div className="bg-glass border border-glass-border rounded-2xl p-6 backdrop-blur-xl flex flex-wrap gap-6 items-end z-10 relative">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm text-white/50">Цена</label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="от" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 h-[50px] focus:outline-none focus:border-brand-purple text-white transition-colors" />
            <span className="text-white/30">-</span>
            <input type="number" placeholder="до" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 h-[50px] focus:outline-none focus:border-brand-purple text-white transition-colors" />
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm text-white/50">Страна</label>
          <CountrySelect value={filterCountry} onChange={setFilterCountry} placeholder="Любая страна" />
        </div>
        <Button className="w-full sm:w-auto px-8 h-[50px]" onClick={() => fetchProducts()}>Применить</Button>
      </div>

      {/* Catalog Table */}
      <div className="bg-glass border border-glass-border rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-white/50 font-medium">Страна</th>
                <th className="p-6 text-white/50 font-medium">Регистрация</th>
                <th className="p-6 text-white/50 font-medium">2FA</th>
                <th className="p-6 text-white/50 font-medium">Спамблок</th>
                <th className="p-6 text-white/50 font-medium">Цена</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">Загрузка...</td>
                </tr>
              ) : products.filter(p => filterCountry ? p.country.includes(filterCountry) : true).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">Нет товаров в наличии</td>
                </tr>
              ) : (
                products.filter(p => filterCountry ? p.country.includes(filterCountry) : true).map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 10, position: 'relative' }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="border-b border-white/5 last:border-0 transition-colors"
                  >
                    <td className="p-6">{product.country}</td>
                    <td className="p-6">{product.registration}</td>
                    <td className="p-6">{product.twoFA}</td>
                    <td className="p-6">{product.spamBlock}</td>
                    <td className="p-6">{product.price.toFixed(2)} ₽</td>
                    <td className="p-6 text-right">
                      <Button onClick={() => handleBuyClick(product)} className="px-8 py-2">Купить</Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buy Modal */}
      <Modal isOpen={buyModalOpen} onClose={() => { if(buyStatus !== 'checking' && buyStatus !== 'processing') setBuyModalOpen(false) }}>
        <AnimatePresence mode="wait">
          {buyStatus === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              
              <h3 className="text-xl font-medium">Подтверждение</h3>
              <div className="bg-black/20 rounded-xl p-4 text-left space-y-2 text-sm border border-white/5">
                 <p><span className="text-white/50">ID:</span> {selectedProduct?.idDigits || 9} цифр</p>
                 <p><span className="text-white/50">Зарегистрирован:</span> {selectedProduct?.registration || 'Неизвестно'}</p>
                 <p><span className="text-white/50">Выставлен:</span> {selectedProduct?.addedDate ? new Date(selectedProduct.addedDate).toLocaleDateString() : 'Неизвестно'}</p>
                 <p><span className="text-white/50">Сессия бота:</span> {selectedProduct?.hasBotSession ? 'Есть' : 'Нет'}</p>
              </div>
              <p className="text-white/70 pt-2">
                Цена аккаунта: <span className="font-semibold text-brand-purple">{selectedProduct?.price.toFixed(2)} ₽</span>
              </p>
              
              <div className="flex flex-col gap-3 justify-center pt-2">
                <Button 
                    variant="secondary" 
                    className="w-full bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 border border-brand-purple/20"
                    onClick={async () => {
                        setBuyStatus('checking');
                        try {
                            const res = await fetch('/api/product/check-validity', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId: selectedProduct?.id })
                            });
                            const data = await res.json();
                            if (data.success) {
                                toast.success('Аккаунт валиден!');
                                setBuyStatus('idle');
                            } else {
                                setBuyError(data.message);
                                setBuyStatus('error');
                                fetchProducts(); // refresh catalog to hide it
                            }
                        } catch(e) {
                            setBuyError('Ошибка при проверке');
                            setBuyStatus('error');
                        }
                    }}
                >
                    Проверить на валидность
                </Button>
                <div className="flex gap-4 mt-2">
                    <Button variant="secondary" onClick={() => setBuyModalOpen(false)} className="flex-1">Отмена</Button>
                    <Button onClick={confirmBuy} className="flex-1">Купить</Button>
                </div>
              </div>

            </motion.div>
          )}

          {buyStatus === 'checking' && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-brand-purple rounded-full animate-spin mx-auto" />
              <p className="text-white/70">Проверка товара...</p>
            </motion.div>
          )}

          {buyStatus === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-brand-purple rounded-full animate-spin mx-auto" />
              <p className="text-white/70">Оформление покупки...</p>
            </motion.div>
          )}

          {buyStatus === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
              <p className="text-xl font-medium">Покупка успешно завершена</p>
              <p className="text-white/50 text-sm">Аккаунт добавлен в историю покупок.</p>
              <Button onClick={() => setBuyModalOpen(false)} className="w-full mt-4">Закрыть</Button>
            </motion.div>
          )}

          {buyStatus === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <p className="text-xl font-medium text-red-400">Ошибка</p>
              <p className="text-white/70">{buyError}</p>
              <Button variant="secondary" onClick={() => setBuyModalOpen(false)} className="w-full mt-4">Закрыть</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}
