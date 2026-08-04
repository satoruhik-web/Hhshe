import { Markup } from 'telegraf';
try {
    const kb = Markup.keyboard([
        [Markup.button.url('🔥 Открыть Магазин 🔥', 'https://google.com')]
    ]).resize();
    console.log(kb);
} catch (e) {
    console.error(e);
}
