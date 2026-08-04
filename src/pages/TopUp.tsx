import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button, Modal, Input } from '../components/UI';
import { CheckCircle2, Wallet, RefreshCw, Key } from 'lucide-react';

export function TopUp() {
  const { user, updateBalance } = useAuth();
  const [tab, setTab] = useState<'crypto' | 'code'>('crypto');
  
  // Crypto
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USDT' | 'TON'>('USDT');
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [payUrl, setPayUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Code
  const [topupCode, setTopupCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  // Fake exchange rates
  const rates = {
    USDT: 90, // 1 USDT = 90 RUB
    TON: 200, // 1 TON = 200 RUB
  };

  const calculatedAmount = amount ? (parseFloat(amount) / rates[currency]).toFixed(4) : '0.0000';

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStatus('checking');
    setModalOpen(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/topup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amountRub: parseFloat(amount), currency })
      });
      const data = await res.json();
      
      if (data.success) {
        setInvoiceId(data.invoiceId);
        setPayUrl(data.payUrl);
        window.open(data.payUrl, '_blank');
        startPolling(data.invoiceId);
      } else {
        setStatus('error');
        setErrorMessage(data.message);
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMessage("Ошибка соединения");
    }
  };

  const startPolling = (invId: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/topup/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: invId, userId: user?.id, amountRub: parseFloat(amount), currency })
        });
        const data = await res.json();
        
        if (data.success) {
          clearInterval(interval);
          if (!data.alreadyProcessed) updateBalance(data.balance);
          setStatus('success');
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
    
    // Safety cleanup after 30 minutes
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const checkPayment = () => {
    if (invoiceId) startPolling(invoiceId);
  };
  
  const handleClaimCode = async () => {
      if (!topupCode.trim()) return;
      setCodeLoading(true);
      setCodeError('');
      setCodeSuccess('');
      try {
          const res = await fetch('/api/topup/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: topupCode.trim(), userId: user?.id })
          });
          const data = await res.json();
          if (data.success) {
              updateBalance(data.balance);
              setCodeSuccess('Баланс успешно пополнен!');
              setTopupCode('');
          } else {
              setCodeError(data.message);
          }
      } catch (e) {
          setCodeError('Ошибка соединения');
      } finally {
          setCodeLoading(false);
      }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass border border-glass-border rounded-2xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-transparent opacity-50" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand-purple/20 rounded-xl flex items-center justify-center border border-brand-purple/30">
            <Wallet className="w-6 h-6 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-xl font-medium">Пополнить баланс</h2>
            <p className="text-white/50 text-sm">выберите способ пополнения</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl">
            <button 
                onClick={() => setTab('crypto')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'crypto' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
                Crypto Bot
            </button>
            <button 
                onClick={() => setTab('code')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'code' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
                По коду
            </button>
        </div>

        <AnimatePresence mode="wait">
        {tab === 'crypto' ? (
        <motion.div key="crypto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Сумма пополнения (₽)</label>
            <Input 
              type="number" 
              placeholder="100" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Валюта оплаты</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="currency" value="USDT" checked={currency === 'USDT'} onChange={() => setCurrency('USDT')} className="hidden" />
                <div className={`p-4 rounded-xl border text-center transition-all ${currency === 'USDT' ? 'bg-brand-purple/20 border-brand-purple text-white shadow-[0_0_15px_rgba(122,27,242,0.2)]' : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/5'}`}>
                  USDT
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="currency" value="TON" checked={currency === 'TON'} onChange={() => setCurrency('TON')} className="hidden" />
                <div className={`p-4 rounded-xl border text-center transition-all ${currency === 'TON' ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/5'}`}>
                  TON
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
            <span className="text-white/70">К оплате:</span>
            <span className="font-medium text-xl">{calculatedAmount} {currency}</span>
          </div>

          <Button onClick={handleTopup} className="w-full py-4 text-lg mt-4" disabled={!amount || parseFloat(amount) <= 0}>
            Оплатить через Crypto Bot
          </Button>
        </motion.div>
        ) : (
        <motion.div key="code" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm text-white/70">Секретный код пополнения</label>
                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input 
                        type="text" 
                        placeholder="Введите код" 
                        value={topupCode}
                        onChange={(e) => setTopupCode(e.target.value)}
                        className="pl-12"
                    />
                </div>
            </div>
            
            <AnimatePresence>
                {codeError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-sm">
                        {codeError}
                    </motion.p>
                )}
                {codeSuccess && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-green-400 text-sm">
                        {codeSuccess}
                    </motion.p>
                )}
            </AnimatePresence>

            <Button onClick={handleClaimCode} loading={codeLoading} className="w-full py-4 text-lg mt-4" disabled={!topupCode.trim()}>
                Активировать код
            </Button>
            
            <p className="text-white/40 text-xs text-center mt-4">
                Убедитесь, что вы привязали свой номер телефона в Telegram боте, так как коды пополнения привязываются к вашему аккаунту.
            </p>
        </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => { if(status !== 'checking') setModalOpen(false) }}>
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <h3 className="text-xl font-medium">Ожидание оплаты</h3>
              <p className="text-white/70">
                Пожалуйста, оплатите счет в Crypto Bot на сумму <br/>
                <span className="font-semibold text-xl text-white">{calculatedAmount} {currency}</span>
              </p>
              <Button onClick={checkPayment} className="w-full py-3">
                <RefreshCw className="w-5 h-5 mr-2" />
                Проверить оплату
              </Button>
              <Button variant="secondary" onClick={() => setModalOpen(false)} className="w-full">Отмена</Button>
            </motion.div>
          )}

          {status === 'checking' && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-8">
              <div className="w-12 h-12 border-4 border-white/10 border-t-brand-purple rounded-full animate-spin mx-auto" />
              <h3 className="text-xl font-medium">Ожидание оплаты</h3>
              <p className="text-white/70">
                Счет открыт в новой вкладке. Если окно не открылось, нажмите кнопку ниже:
              </p>
              {payUrl && (
                <Button onClick={() => window.open(payUrl, '_blank')} className="w-full">
                  Перейти к оплате
                </Button>
              )}
              <p className="text-white/50 text-sm mt-4">Мы автоматически проверим поступление средств...</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                <RefreshCw className="w-8 h-8" />
              </div>
              <p className="text-xl font-medium text-red-400">Ошибка</p>
              <p className="text-white/70">{errorMessage}</p>
              <Button onClick={() => setModalOpen(false)} className="w-full mt-4">Закрыть</Button>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
              <p className="text-xl font-medium">Баланс пополнен!</p>
              <Button onClick={() => setModalOpen(false)} className="w-full mt-4">Отлично</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}
