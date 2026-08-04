import React, { useEffect, useState } from 'react';

export function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  const tgId = tgUser?.id || 1; // 1 fallback for testing

  useEffect(() => {
    fetch(`/api/user/${tgId}`).then(r => r.json()).then(setUser);
  }, [tgId]);

  if (!user) return <div className="p-8 text-center text-white/50">Загрузка профиля...</div>;

  return (
    <div className="p-6 pt-12 space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 bg-black/20 p-4 rounded-[2rem] border border-white/5">
        <img 
          src={tgUser?.photo_url || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=150&h=150&crop=faces'} 
          alt="Avatar" 
          className="w-14 h-14 rounded-full border-2 border-brand-purple object-cover"
        />
        <div>
          <h2 className="font-bold text-lg">{tgUser?.first_name || 'Игрок'} {tgUser?.last_name || ''}</h2>
          <p className="text-white/50 text-sm">@{tgUser?.username || 'username'}</p>
        </div>
      </div>

      <div className="bg-glass border border-glass-border rounded-[2rem] p-8 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-[50px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 blur-[50px] pointer-events-none" />
         
         <h2 className="text-white/50 mb-2 font-medium tracking-wide">ТЕКУЩИЙ БАЛАНС</h2>
         <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-brand-purple drop-shadow-lg">
           {user.balance} 💎
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-black/30 border border-white/5 rounded-[1.5rem] p-5 text-center transition-all hover:bg-black/40">
            <div className="text-4xl mb-2">💣</div>
            <div className="font-bold text-lg">Mines</div>
            <div className="text-xs text-brand-purple font-medium mt-1">ИГРАТЬ В ЧАТЕ</div>
         </div>
         <div className="bg-black/30 border border-white/5 rounded-[1.5rem] p-5 text-center transition-all hover:bg-black/40">
            <div className="text-4xl mb-2">🎁</div>
            <div className="font-bold text-lg">Бонус</div>
            <div className="text-xs text-brand-purple font-medium mt-1">РАЗ В 24 ЧАСА</div>
         </div>
      </div>
      
      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-2xl p-6 mt-8">
        <h3 className="font-bold mb-2 flex items-center gap-2 text-brand-purple">
           <span className="text-xl">🚀</span> Быстрый старт
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
           Закройте это окно и напишите в чат с ботом команду <code>токен 500</code> чтобы моментально начать игру в Mines!
        </p>
      </div>
    </div>
  );
}
