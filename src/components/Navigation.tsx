import { NavLink } from 'react-router-dom';
import { LayoutGrid, Wallet, User as UserIcon, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function Navigation() {
  const { user } = useAuth();

  const links = [
    { to: '/', icon: LayoutGrid, label: 'Каталог' },
    { to: '/topup', icon: Wallet, label: 'Пополнить баланс' },
    { to: '/profile', icon: UserIcon, label: 'Профиль' },
  ];

  if (user?.isAdmin) {
    links.push({ to: '/admin', icon: ShieldAlert, label: 'Админ' });
  }

  return (
    <nav className="flex justify-center p-4 w-full max-w-3xl mx-auto">
      <div className="flex bg-glass border border-glass-border rounded-2xl p-2 backdrop-blur-xl gap-2 w-full sm:w-auto shadow-[0_0_40px_rgba(122,27,242,0.1)]">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                  "hover:bg-white/5",
                  isActive 
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(122,27,242,0.2)] border border-white/10" 
                    : "text-white/60 hover:text-white"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:block">{link.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
