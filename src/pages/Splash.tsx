import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function Splash() {
  const navigate = useNavigate();
  const tg = (window as any).Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  useEffect(() => {
    if (tg) tg.expand();
    setTimeout(() => navigate('/casino/dashboard'), 3500);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#0f051c] flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 blur-[100px] pointer-events-none" />
      
      <motion.img
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        src={user?.photo_url || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=150&h=150&crop=faces'}
        className="w-32 h-32 rounded-full mb-6 border-4 border-brand-purple shadow-[0_0_40px_rgba(122,27,242,0.6)] object-cover"
      />
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
      >
        Здравствуйте, {user?.first_name || 'Игрок'}!
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-brand-purple mt-2 tracking-widest text-sm font-medium uppercase"
      >
        Premium Casino
      </motion.p>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 250 }}
        transition={{ delay: 1.2, duration: 1.8, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-brand-purple to-pink-500 mt-12 rounded-full shadow-[0_0_10px_rgba(122,27,242,0.8)]"
      />
    </div>
  );
}
