import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'en' | 'uk';

type LanguageContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  ru: {
    nav_products: 'Товары',
    nav_topup: 'Пополнить',
    nav_profile: 'Профиль',
    nav_admin: 'Админ',
    profile: 'Профиль',
    balance: 'Баланс',
    support: 'Поддержка',
    logout: 'Выйти из аккаунта',
    history_buy: 'История покупок',
    history_topup: 'История пополнений',
    language: 'Язык'
  },
  en: {
    nav_products: 'Products',
    nav_topup: 'Top Up',
    nav_profile: 'Profile',
    nav_admin: 'Admin',
    profile: 'Profile',
    balance: 'Balance',
    support: 'Support',
    logout: 'Log Out',
    history_buy: 'Purchase History',
    history_topup: 'Top-up History',
    language: 'Language'
  },
  uk: {
    nav_products: 'Товари',
    nav_topup: 'Поповнити',
    nav_profile: 'Профіль',
    nav_admin: 'Адмін',
    profile: 'Профіль',
    balance: 'Баланс',
    support: 'Підтримка',
    logout: 'Вийти з акаунта',
    history_buy: 'Історія покупок',
    history_topup: 'Історія поповнень',
    language: 'Мова'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  setLang: () => {},
  t: (key) => key
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key: string) => {
    return translations[lang][key] || translations['ru'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
