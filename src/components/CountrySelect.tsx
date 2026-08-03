import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const countries = [
  "Россия (RU)", "США (US)", "Великобритания (GB)", "Германия (DE)", 
  "Франция (FR)", "Канада (CA)", "Индия (IN)", "Китай (CN)", 
  "Бразилия (BR)", "Казахстан (KZ)", "Индонезия (ID)", "Турция (TR)",
  "Украина (UA)", "Польша (PL)", "Испания (ES)", "Италия (IT)",
  "Австралия (AU)", "Япония (JP)", "Южная Корея (KR)"
];

export function CountrySelect({ value, onChange, placeholder = "Выберите страну" }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative flex-1 min-w-[200px]" ref={wrapperRef}>
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer hover:border-brand-purple transition-colors h-[50px]"
      >
        <span className={value ? "text-white truncate" : "text-white/50 truncate"}>{value || placeholder}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-white/50 min-w-[20px]" />
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0f051c] border border-glass-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-black/20">
              <Search className="w-4 h-4 text-white/50 ml-2" />
              <input 
                type="text" 
                autoFocus
                placeholder="Поиск..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none text-sm text-white focus:outline-none w-full py-2"
              />
            </div>
            <div className="max-h-56 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-white/50 text-sm">Ничего не найдено</div>
              ) : (
                filtered.map(c => (
                  <div 
                    key={c} 
                    onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                    className="px-4 py-3 hover:bg-brand-purple/20 cursor-pointer text-sm transition-colors"
                  >
                    {c}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
