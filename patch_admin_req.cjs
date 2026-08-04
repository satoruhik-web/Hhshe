const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

code = code.replace(
    `onClick={() => alert('Сымитирована отправка кода на номер: ' + newProduct.phone)}`,
    `onClick={async () => {
        try {
            const res = await fetch('/api/admin/bot-session/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: newProduct.phone })
            });
            const data = await res.json();
            if(data.success) {
                alert('Код успешно запрошен (отправлен сервером Telegram)');
            }
        } catch(e) {
            alert('Ошибка запроса кода');
        }
    }}`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
