const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(`    } else {
        res.status(400).json({ success: false, message: 'Сессия бота недоступна. Попросите администратора перепривязать аккаунт.' });
    }
});
    } else {
        res.status(400).json({ success: false, message: 'Сессия бота недоступна' });
    }
});`, `    } else {
        res.status(400).json({ success: false, message: 'Сессия бота недоступна. Попросите администратора перепривязать аккаунт.' });
    }
});`);

fs.writeFileSync('server.ts', code);
