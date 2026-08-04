import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Jackpot() {
  const [state, setState] = useState<any>({ players: [], total: 0, status: 'waiting', endTime: 0 });
  const [bet, setBet] = useState('');
  const tgId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 1;
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch(`/api/user/${tgId}`).then(r => r.json()).then(data => setBalance(data.balance || 0));

    const int = setInterval(() => {
      fetch('/api/jackpot/state').then(r => r.json()).then(setState);
    }, 1000);
    return () => clearInterval(int);
  }, [tgId]);

  const placeBet = async () => {
    if (!bet || parseInt(bet) <= 0) return;
    const res = await fetch('/api/jackpot/bet', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId: tgId, amount: parseInt(bet) })
    });
    const data = await res.json();
    if (data.success) {
       setBalance(data.balance);
       setBet('');
    } else {
       alert(data.error);
    }
  };

  const timeLeft = state.endTime > 0 ? Math.max(0, Math.floor((state.endTime - Date.now()) / 1000)) : 0;

  // Calculate slices for the wheel
  const wheelData = useMemo(() => {
    if (!state.players || state.players.length === 0) return null;
    let currentAngle = 0;
    const slices = state.players.map((p: any) => {
      const percentage = p.amount / state.total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      return { ...p, percentage, startAngle, endAngle };
    });

    const gradientStops = slices.map((s: any) => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`).join(', ');
    
    // Find rotation for winner
    let targetRotation = 0;
    if (state.status === 'spinning' && state.winner) {
      const winnerSlice = slices.find((s: any) => s.userId === state.winner.userId);
      if (winnerSlice) {
         // Target angle: we want the middle of the winner's slice to be at the top (270 degrees in CSS conic-gradient which starts at top)
         // Wait, conic-gradient starts at 12 o'clock (0deg). So if we want the pointer at 12 o'clock, 
         // we need to rotate by 360 * spins - (winnerSlice.startAngle + winnerSlice.endAngle)/2
         const sliceMiddle = (winnerSlice.startAngle + winnerSlice.endAngle) / 2;
         targetRotation = (360 * 5) - sliceMiddle; // 5 full spins backwards to align
      }
    }

    return { slices, gradientStops, targetRotation };
  }, [state.players, state.total, state.status, state.winner]);

  return (
    <div className="p-6 pt-12 space-y-6 max-w-md mx-auto pb-24">
      <div className="text-center mb-6">
         <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-pink-500">
           Колесо Фортуны
         </h1>
         <p className="text-white/50 text-sm mt-1">Выигрывает один, забирает всё!</p>
      </div>
      
      {/* Wheel Visualization */}
      <div className="w-full h-72 relative flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-6 h-8 z-20">
          <svg viewBox="0 0 24 24" fill="white" className="drop-shadow-[0_0_10px_white]">
            <path d="M12 24L0 0h24z" />
          </svg>
        </div>

        {wheelData ? (
          <motion.div 
            className="w-64 h-64 rounded-full border-4 border-black/40 shadow-[0_0_50px_rgba(122,27,242,0.3)] relative overflow-hidden"
            style={{ 
              background: `conic-gradient(${wheelData.gradientStops})` 
            }}
            animate={state.status === 'spinning' ? { rotate: wheelData.targetRotation } : { rotate: 0 }}
            transition={state.status === 'spinning' ? { duration: 4.8, ease: [0.1, 0.9, 0.2, 1] } : { duration: 0 }}
          />
        ) : (
          <div className="w-64 h-64 rounded-full border-4 border-black/40 shadow-[0_0_50px_rgba(122,27,242,0.1)] relative overflow-hidden bg-white/5 flex items-center justify-center">
            <span className="text-white/20 font-bold tracking-widest uppercase">Ждем ставки</span>
          </div>
        )}

        {/* Center overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 bg-[#0f051c] rounded-full border-4 border-black/50 shadow-inner flex flex-col items-center justify-center">
             {state.status === 'waiting' && (
                <>
                  <span className="text-xl font-bold text-white drop-shadow-md">{state.total} 💎</span>
                  {state.endTime > 0 && <span className="text-pink-400 font-bold text-xs mt-1 animate-pulse">{timeLeft}с</span>}
                </>
             )}
             {state.status === 'spinning' && (
                <span className="text-lg font-bold text-brand-purple animate-pulse">Крутим!</span>
             )}
          </div>
        </div>

        {/* Winner overlay */}
        <AnimatePresence>
          {state.status === 'finished' && state.winner && (
             <motion.div 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 rounded-3xl backdrop-blur-sm border border-white/10"
              >
                <div className="text-sm text-brand-purple font-bold uppercase tracking-widest mb-1">Победитель!</div>
                <div className="text-3xl font-bold text-white mb-2">{state.winner.name}</div>
                <div className="text-green-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                  +{state.total} 💎
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-black/20 p-4 rounded-3xl border border-white/5 shadow-inner mt-4">
         <div className="flex justify-between text-sm mb-3 px-2">
            <span className="text-white/50">Ваш баланс:</span>
            <span className="font-bold text-brand-purple">{balance} 💎</span>
         </div>
         <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Сумма" 
              value={bet}
              onChange={e => setBet(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-brand-purple outline-none font-medium transition-colors"
            />
            <button 
              onClick={placeBet}
              disabled={state.status !== 'waiting'}
              className="bg-gradient-to-r from-brand-purple to-pink-500 hover:from-brand-purple/80 hover:to-pink-500/80 text-white px-8 rounded-2xl font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(122,27,242,0.4)] active:scale-95"
            >
              Внести
            </button>
         </div>
      </div>

      <div className="space-y-3 mt-8">
        <h3 className="text-white/50 text-xs uppercase tracking-widest mb-4 font-semibold px-2 flex justify-between">
          <span>Участники</span>
          <span>{state.players.length}</span>
        </h3>
        {state.players.map((p: any, i: number) => {
          const wheelP = wheelData?.slices?.find((s:any) => s.userId === p.userId);
          const percent = wheelP ? (wheelP.percentage * 100).toFixed(1) : 0;
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 relative overflow-hidden"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 opacity-10 pointer-events-none"
                style={{ backgroundColor: p.color, width: `${percent}%` }}
              />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 shadow-inner flex items-center justify-center font-bold text-xs text-white drop-shadow-md" style={{ backgroundColor: p.color }}>
                  {percent}%
                </div>
                <span className="font-medium text-lg">{p.name}</span>
              </div>
              <div className="text-brand-purple font-bold text-lg relative z-10">{p.amount} 💎</div>
            </motion.div>
          );
        })}
        {state.players.length === 0 && (
           <p className="text-center text-white/30 py-8 border border-dashed border-white/10 rounded-3xl">
              Нет ставок. Стань первым!
           </p>
        )}
      </div>
    </div>
  );
}
