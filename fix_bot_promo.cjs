const fs = require('fs');
let code = fs.readFileSync('bot.ts', 'utf-8');

code = code.replace(
`export interface Promo {
  code: string;
  tokens: number;
  maxUses: number;
  uses: number;
  expiry: number | null;
  isActive: boolean;
  usedBy: number[];
}`,
`export interface Promo {
  code: string;
  amount: number;
  maxUses: number | null;
  uses: number;
  expiry: number | null;
  createdBy: string;
  hideAdmin: boolean;
  createdAt: number;
  usedBy: { userId: number, usedAt: number }[];
}`
);

fs.writeFileSync('bot.ts', code);
