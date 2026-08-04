import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, Target } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navs = [
    { path: '/casino/dashboard', icon: Home, label: 'Главная' },
    { path: '/casino/jackpot', icon: Target, label: 'Джекпот' },
    { path: '/casino/leaderboard', icon: Trophy, label: 'Топ' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f051c]/90 backdrop-blur-xl border-t border-white/10 p-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navs.map(n => {
          const active = location.pathname === n.path;
          const Icon = n.icon;
          return (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? 'text-brand-purple' : 'text-white/50 hover:text-white/80'}`}
            >
              <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{n.label}</span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
