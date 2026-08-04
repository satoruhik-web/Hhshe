import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function Leaderboard() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setList);
  }, []);

  return (
    <div className="p-6 pt-12 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/20 blur-[60px] pointer-events-none" />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white mb-4 shadow-xl shadow-yellow-500/20 relative z-10">
           <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
          Зал Славы
        </h1>
        <p className="text-white/50 text-sm mt-1">Топ 50 самых крупных выигрышей</p>
      </div>

      <div className="space-y-3">
        {list.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={item.id} 
            className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:bg-black/40 transition-colors"
          >
            {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent pointer-events-none" />}
            {i === 1 && <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent pointer-events-none" />}
            {i === 2 && <div className="absolute inset-0 bg-gradient-to-r from-amber-700/20 to-transparent pointer-events-none" />}
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-lg
                ${i === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' : 
                  i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 
                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-black' : 
                  'bg-white/10'}`}
              >
                {i + 1}
              </div>
              <div>
                <div className="font-bold text-lg">{item.name}</div>
                <div className="text-xs text-white/40 font-medium tracking-wide">
                   {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-400 relative z-10">
              +{item.win} 💎
            </div>
          </motion.div>
        ))}
        {list.length === 0 && (
           <div className="text-center text-white/40 py-10 bg-black/20 rounded-3xl border border-dashed border-white/10">
              Пока нет записей. Станьте первым!
           </div>
        )}
      </div>
    </div>
  );
}
