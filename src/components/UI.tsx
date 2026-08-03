import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title?: string, children: ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-[#0f051c] border border-glass-border rounded-2xl p-6 shadow-[0_0_50px_rgba(122,27,242,0.15)] backdrop-blur-xl">
              {title && <h3 className="text-xl font-medium mb-6 text-center">{title}</h3>}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  loading,
  ...props 
}: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'primary' && "bg-brand-purple hover:bg-brand-purple-dark text-white shadow-[0_0_20px_rgba(122,27,242,0.3)] hover:shadow-[0_0_30px_rgba(122,27,242,0.5)]",
        variant === 'secondary' && "bg-white/5 hover:bg-white/10 text-white border border-white/10",
        variant === 'danger' && "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 hover:border-red-500/40",
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
    </motion.button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple focus:bg-black/40 transition-all",
        className
      )}
    />
  );
}
