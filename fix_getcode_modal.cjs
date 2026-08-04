const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Add state for the get-code modal
code = code.replace(
    "const [promoSuccess, setPromoSuccess] = useState<any>(null);",
    "const [promoSuccess, setPromoSuccess] = useState<any>(null);\n  const [codeModal, setCodeModal] = useState<string | null>(null);"
);

// Modify the request-code onClick logic
code = code.replace(
    /setPurchaseCode\(\{ \.\.\.purchaseCode, \[p\.purchaseId\]: data\.code \}\);/,
    "setCodeModal(data.code);"
);

// Add codeModal JSX
const codeModalJSX = `
      {codeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background-light border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white/70">Код авторизации</h3>
            
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 cursor-pointer hover:bg-black/60 transition-colors" onClick={() => {
                navigator.clipboard.writeText(codeModal);
                toast.success('Код скопирован!');
            }}>
                <p className="text-5xl font-mono tracking-widest text-brand-purple font-black">{codeModal}</p>
                <p className="text-xs text-white/30 mt-4 uppercase tracking-wider">Нажмите, чтобы скопировать</p>
            </div>
            
            <Button className="w-full py-4 text-lg bg-white/5 hover:bg-white/10 text-white" onClick={() => setCodeModal(null)}>Закрыть</Button>
          </motion.div>
        </div>
      )}
`;

code = code.replace(/\{logoutModal && \(/, codeModalJSX + "\n      {logoutModal && (");

fs.writeFileSync('src/pages/Profile.tsx', code);
