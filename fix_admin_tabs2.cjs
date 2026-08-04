const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Update activeTab type
code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<.*>\('products'\);/,
    "const [activeTab, setActiveTab] = useState<'products' | 'users' | 'codes' | 'review' | 'promos'>('products');"
);

// Add tab button
code = code.replace(
    /<\/button>\s*<\/div>\s*\{activeTab === 'products'/g,
    `</button>
        <button 
          onClick={() => setActiveTab('promos')} 
          className={cn("px-4 py-2 font-medium transition-colors whitespace-nowrap", activeTab === 'promos' ? "text-brand-purple border-b-2 border-brand-purple" : "text-white/50 hover:text-white")}
        >
          Промокоды
        </button>
      </div>

      {activeTab === 'products'`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
