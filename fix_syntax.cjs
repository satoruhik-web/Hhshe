const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(`    } else {
        res.json({ success: false, message: result.message || 'Неверный код' });
    }
});
});`, `    } else {
        res.json({ success: false, message: result.message || 'Неверный код' });
    }
});`);
fs.writeFileSync('server.ts', code);
