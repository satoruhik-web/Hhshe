const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Add "Промокоды" tab
code = code.replace(
    /<button \n          onClick=\{\(\) => setActiveTab\('settings'\)\} /g,
    `<button 
          onClick={() => setActiveTab('promos')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'promos' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Промокоды
        </button>
        <button 
          onClick={() => setActiveTab('settings')} `
);

fs.writeFileSync('src/pages/Admin.tsx', code);
