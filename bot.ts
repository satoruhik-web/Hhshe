import { Telegraf, Markup, session, Context } from 'telegraf';
import fs from 'fs';
import path from 'path';
import * as crypto from 'crypto';

// Types
export interface User {
  id: number;
  username?: string;
  first_name?: string;
  phone?: string;
  password?: string;
  balance: number;
  lastBonus: number;
  isBlocked: boolean;
  isAdmin?: boolean;
}

export interface Promo {
  code: string;
  amount: number;
  maxUses: number | null;
  uses: number;
  expiry: number | null;
  createdBy: string;
  hideAdmin: boolean;
  createdAt: number;
  usedBy: { userId: number, usedAt: number }[];
}

export interface Settings {
  dailyBonus: number;
  adminIds: number[];
}

export interface BotDB {
  users: Record<number, User>;
  promos: Record<string, Promo>;
  settings: Settings;
  tokens: Record<string, any>;
  history: any[];
}

export interface SessionData {
  state?: string;
  tempData?: any;
}

export interface MyContext extends Context {
  session?: SessionData;
}

const DB_PATH = path.join(process.cwd(), 'bot_db.json');

export let db: BotDB = {
  users: {},
  promos: {},
  settings: {
    dailyBonus: 1500,
    adminIds: [],
  },
  tokens: {},
  history: [],
  withdrawals: [],
  topups: [],
  tg_sessions: {},
  products: {}
};

function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      db = { ...db, ...data };
      if (!db.tokens) db.tokens = {};
    } catch (e) {
      console.error('Error loading bot_db.json', e);
    }
  } else {
    saveDB();
  }
}

export function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

loadDB();

const BOT_TOKEN = process.env.BOT_TOKEN || '8827470879:AAHcxyzmtC8U3KcruiTLnXi-BeFteU9nJQ8';
export const bot = new Telegraf<MyContext>(BOT_TOKEN);

bot.use(session());

bot.use(async (ctx, next) => {
  if (ctx.from) {
    const id = ctx.from.id;
    if (!db.users[id]) {
      db.users[id] = {
        id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        balance: 0,
        lastBonus: 0,
        isBlocked: false,
        isAdmin: false
      };
      // Auto-assign first user as admin if none exists
      if (db.settings.adminIds.length === 0) {
          db.settings.adminIds.push(id);
          db.users[id].isAdmin = true;
      }
      saveDB();
    } else {
      db.users[id].username = ctx.from.username;
      db.users[id].first_name = ctx.from.first_name;
    }
    if (db.users[id].isBlocked) return;
  }
  
  if (ctx.session === undefined) ctx.session = {};
  await next();
});

const getMainMenu = (isAdmin: boolean) => {
    const kb: any[] = [
        [Markup.button.contactRequest('📱 Поделиться контактом для входа')],
        ['🌟 Пополнить баланс (Звезды)', '👤 Профиль'],
        [Markup.button.url('🛠 Поддержка', 'https://t.me/EmoRoman')]
    ];
    if (isAdmin) kb.push(['👑 Админ-панель']);
    return Markup.keyboard(kb).resize();
};

bot.start((ctx) => {
  ctx.session = {}; 
  const isAdmin = db.settings.adminIds.includes(ctx.from.id);
  
  const webAppUrl = process.env.PUBLIC_URL || 'https://ais-pre-mcvy6r2iwtln3q756flga7-260474887662.europe-west3.run.app';

  ctx.reply('Добро пожаловать в Telzo Shop! 👋\n\nЗдесь вы можете приобрести Telegram Premium, Звезды, Robux и многое другое по лучшим ценам.\n\nНажмите кнопку "Поделиться контактом", чтобы мы могли зарегистрировать вас, или просто откройте магазин!', { 
      parse_mode: 'HTML', 
      ...Markup.inlineKeyboard([
          [Markup.button.url('🔥 Открыть Магазин 🔥', webAppUrl)]
      ])
  });
  
  ctx.reply('Основное меню:', getMainMenu(isAdmin));
});

bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;
    if (contact.user_id !== ctx.from.id) {
        return ctx.reply('Пожалуйста, отправьте свой собственный контакт.');
    }
    
    let phone = contact.phone_number.replace(/[^0-9]/g, '');
    if (!phone.startsWith('+')) phone = '+' + phone;
    const userId = ctx.from.id;
    
    if (db.users[userId]) {
        db.users[userId].phone = phone; 
    }
    saveDB();
    
    ctx.reply('Контакт успешно привязан! ✅\n\nТеперь вы можете вернуться на сайт и войти по вашему номеру телефона.');
});

bot.hears('🌟 Пополнить баланс (Звезды)', (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.state = 'wait_stars_amount';
    ctx.reply('Введите количество звезд для пополнения (1 звезда = 1 ₽):', Markup.inlineKeyboard([
        [Markup.button.callback('Отмена', 'cancel_state')]
    ]));
});

bot.on('text', (ctx, next) => {
    const state = ctx.session?.state;
    const text = ctx.message.text;
    const userId = ctx.from.id;

    if (state === 'wait_stars_amount') {
        const amount = parseInt(text);
        if (isNaN(amount) || amount < 1 || amount > 10000) {
            return ctx.reply('❌ Пожалуйста, введите корректное количество звезд (от 1 до 10000):');
        }
        ctx.session.state = '';
        
        return ctx.replyWithInvoice({
            title: 'Пополнение баланса',
            description: `Пополнение баланса магазина на ${amount} ₽`,
            payload: `topup_${userId}`,
            provider_token: '', // empty for Telegram Stars
            currency: 'XTR',
            prices: [{ label: 'Пополнение баланса', amount: amount }]
        });
    }
    
    return next();
});

bot.hears('👤 Профиль', (ctx) => {
  const user = db.users[ctx.from.id];
  ctx.reply(`👤 <b>Твой Профиль</b>\n\nID: <code>${user.id}</code>\nИмя: <b>${user.first_name}</b>\nБаланс: <b>${user.balance}</b> ₽`, { parse_mode: 'HTML' });
});

bot.action('cancel_state', (ctx) => {
    if (ctx.session) ctx.session.state = '';
    ctx.editMessageText('Действие отменено.').catch(() => {});
});

bot.on('pre_checkout_query', (ctx) => {
    ctx.answerPreCheckoutQuery(true).catch(console.error);
});

bot.on('successful_payment', (ctx) => {
    const payment = ctx.message.successful_payment;
    const amount = payment.total_amount; 
    const payload = payment.invoice_payload;
    
    if (payload.startsWith('topup_')) {
        const userId = parseInt(payload.split('_')[1]);
        const user = db.users[userId];
        if (user) {
            user.balance += amount;
            saveDB();
            
            ctx.reply(`✅ Оплата ${amount} ⭐️ прошла успешно! Баланс пополнен на ${amount} ₽.`);
        }
    }
});

export function startTelegramBot() {
    bot.launch({ dropPendingUpdates: true }).catch(err => console.error('Telegram bot launch error:', err));
    console.log('Telegram bot is starting...');
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
