import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Lock, Eye, EyeOff, ArrowRight, Phone, Delete, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register_phone' | 'register_standard';

const COUNTRIES = [
  {
    "code": "+7",
    "flag": "🇷🇺",
    "name": "Россия"
  },
  {
    "code": "+7",
    "flag": "🇰🇿",
    "name": "Казахстан"
  },
  {
    "code": "+380",
    "flag": "🇺🇦",
    "name": "Украина"
  },
  {
    "code": "+375",
    "flag": "🇧🇾",
    "name": "Беларусь"
  },
  {
    "code": "+998",
    "flag": "🇺🇿",
    "name": "Узбекистан"
  },
  {
    "code": "+996",
    "flag": "🇰🇬",
    "name": "Кыргызстан"
  },
  {
    "code": "+992",
    "flag": "🇹🇯",
    "name": "Таджикистан"
  },
  {
    "code": "+374",
    "flag": "🇦🇲",
    "name": "Армения"
  },
  {
    "code": "+994",
    "flag": "🇦🇿",
    "name": "Азербайджан"
  },
  {
    "code": "+995",
    "flag": "🇬🇪",
    "name": "Грузия"
  },
  {
    "code": "+373",
    "flag": "🇲🇩",
    "name": "Молдова"
  },
  {
    "code": "+61",
    "flag": "🇦🇺",
    "name": "Австралия"
  },
  {
    "code": "+43",
    "flag": "🇦🇹",
    "name": "Австрия"
  },
  {
    "code": "+355",
    "flag": "🇦🇱",
    "name": "Албания"
  },
  {
    "code": "+213",
    "flag": "🇩🇿",
    "name": "Алжир"
  },
  {
    "code": "+244",
    "flag": "🇦🇴",
    "name": "Ангола"
  },
  {
    "code": "+376",
    "flag": "🇦🇩",
    "name": "Андорра"
  },
  {
    "code": "+1268",
    "flag": "🇦🇬",
    "name": "Антигуа и Барбуда"
  },
  {
    "code": "+54",
    "flag": "🇦🇷",
    "name": "Аргентина"
  },
  {
    "code": "+93",
    "flag": "🇦🇫",
    "name": "Афганистан"
  },
  {
    "code": "+1242",
    "flag": "🇧🇸",
    "name": "Багамы"
  },
  {
    "code": "+880",
    "flag": "🇧🇩",
    "name": "Бангладеш"
  },
  {
    "code": "+1246",
    "flag": "🇧🇧",
    "name": "Барбадос"
  },
  {
    "code": "+973",
    "flag": "🇧🇭",
    "name": "Бахрейн"
  },
  {
    "code": "+501",
    "flag": "🇧🇿",
    "name": "Белиз"
  },
  {
    "code": "+32",
    "flag": "🇧🇪",
    "name": "Бельгия"
  },
  {
    "code": "+229",
    "flag": "🇧🇯",
    "name": "Бенин"
  },
  {
    "code": "+359",
    "flag": "🇧🇬",
    "name": "Болгария"
  },
  {
    "code": "+591",
    "flag": "🇧🇴",
    "name": "Боливия"
  },
  {
    "code": "+387",
    "flag": "🇧🇦",
    "name": "Босния и Герцеговина"
  },
  {
    "code": "+267",
    "flag": "🇧🇼",
    "name": "Ботсвана"
  },
  {
    "code": "+55",
    "flag": "🇧🇷",
    "name": "Бразилия"
  },
  {
    "code": "+673",
    "flag": "🇧🇳",
    "name": "Бруней"
  },
  {
    "code": "+226",
    "flag": "🇧🇫",
    "name": "Буркина-Фасо"
  },
  {
    "code": "+257",
    "flag": "🇧🇮",
    "name": "Бурунди"
  },
  {
    "code": "+975",
    "flag": "🇧🇹",
    "name": "Бутан"
  },
  {
    "code": "+678",
    "flag": "🇻🇺",
    "name": "Вануату"
  },
  {
    "code": "+379",
    "flag": "🇻🇦",
    "name": "Ватикан"
  },
  {
    "code": "+44",
    "flag": "🇬🇧",
    "name": "Великобритания"
  },
  {
    "code": "+36",
    "flag": "🇭🇺",
    "name": "Венгрия"
  },
  {
    "code": "+58",
    "flag": "🇻🇪",
    "name": "Венесуэла"
  },
  {
    "code": "+84",
    "flag": "🇻🇳",
    "name": "Вьетнам"
  },
  {
    "code": "+241",
    "flag": "🇬🇦",
    "name": "Габон"
  },
  {
    "code": "+509",
    "flag": "🇭🇹",
    "name": "Гаити"
  },
  {
    "code": "+595",
    "flag": "🇬🇾",
    "name": "Гайана"
  },
  {
    "code": "+220",
    "flag": "🇬🇲",
    "name": "Гамбия"
  },
  {
    "code": "+233",
    "flag": "🇬🇭",
    "name": "Гана"
  },
  {
    "code": "+502",
    "flag": "🇬🇹",
    "name": "Гватемала"
  },
  {
    "code": "+224",
    "flag": "🇬🇳",
    "name": "Гвинея"
  },
  {
    "code": "+245",
    "flag": "🇬🇼",
    "name": "Гвинея-Бисау"
  },
  {
    "code": "+49",
    "flag": "🇩🇪",
    "name": "Германия"
  },
  {
    "code": "+504",
    "flag": "🇭🇳",
    "name": "Гондурас"
  },
  {
    "code": "+852",
    "flag": "🇭🇰",
    "name": "Гонконг"
  },
  {
    "code": "+1473",
    "flag": "🇬🇩",
    "name": "Гренада"
  },
  {
    "code": "+30",
    "flag": "🇬🇷",
    "name": "Греция"
  },
  {
    "code": "+45",
    "flag": "🇩🇰",
    "name": "Дания"
  },
  {
    "code": "+253",
    "flag": "🇩🇯",
    "name": "Джибути"
  },
  {
    "code": "+1767",
    "flag": "🇩🇲",
    "name": "Доминика"
  },
  {
    "code": "+1849",
    "flag": "🇩🇴",
    "name": "Доминиканская Республика"
  },
  {
    "code": "+20",
    "flag": "🇪🇬",
    "name": "Египет"
  },
  {
    "code": "+260",
    "flag": "🇿🇲",
    "name": "Замбия"
  },
  {
    "code": "+263",
    "flag": "🇿🇼",
    "name": "Зимбабве"
  },
  {
    "code": "+972",
    "flag": "🇮🇱",
    "name": "Израиль"
  },
  {
    "code": "+91",
    "flag": "🇮🇳",
    "name": "Индия"
  },
  {
    "code": "+62",
    "flag": "🇮🇩",
    "name": "Индонезия"
  },
  {
    "code": "+962",
    "flag": "🇯🇴",
    "name": "Иордания"
  },
  {
    "code": "+964",
    "flag": "🇮🇶",
    "name": "Ирак"
  },
  {
    "code": "+98",
    "flag": "🇮🇷",
    "name": "Иран"
  },
  {
    "code": "+353",
    "flag": "🇮🇪",
    "name": "Ирландия"
  },
  {
    "code": "+354",
    "flag": "🇮🇸",
    "name": "Исландия"
  },
  {
    "code": "+34",
    "flag": "🇪🇸",
    "name": "Испания"
  },
  {
    "code": "+39",
    "flag": "🇮🇹",
    "name": "Италия"
  },
  {
    "code": "+967",
    "flag": "🇾🇪",
    "name": "Йемен"
  },
  {
    "code": "+855",
    "flag": "🇰🇭",
    "name": "Камбоджа"
  },
  {
    "code": "+237",
    "flag": "🇨🇲",
    "name": "Камерун"
  },
  {
    "code": "+1",
    "flag": "🇨🇦",
    "name": "Канада"
  },
  {
    "code": "+974",
    "flag": "🇶🇦",
    "name": "Катар"
  },
  {
    "code": "+254",
    "flag": "🇰🇪",
    "name": "Кения"
  },
  {
    "code": "+357",
    "flag": "🇨🇾",
    "name": "Кипр"
  },
  {
    "code": "+686",
    "flag": "🇰🇮",
    "name": "Кирибати"
  },
  {
    "code": "+86",
    "flag": "🇨🇳",
    "name": "Китай"
  },
  {
    "code": "+57",
    "flag": "🇨🇴",
    "name": "Колумбия"
  },
  {
    "code": "+269",
    "flag": "🇰🇲",
    "name": "Коморы"
  },
  {
    "code": "+243",
    "flag": "🇨🇩",
    "name": "Конго (ДРК)"
  },
  {
    "code": "+242",
    "flag": "🇨🇬",
    "name": "Конго (Республика)"
  },
  {
    "code": "+506",
    "flag": "🇨🇷",
    "name": "Коста-Рика"
  },
  {
    "code": "+225",
    "flag": "🇨🇮",
    "name": "Кот-д’Ивуар"
  },
  {
    "code": "+53",
    "flag": "🇨🇺",
    "name": "Куба"
  },
  {
    "code": "+965",
    "flag": "🇰🇼",
    "name": "Кувейт"
  },
  {
    "code": "+856",
    "flag": "🇱🇦",
    "name": "Лаос"
  },
  {
    "code": "+371",
    "flag": "🇱🇻",
    "name": "Латвия"
  },
  {
    "code": "+266",
    "flag": "🇱🇸",
    "name": "Лесото"
  },
  {
    "code": "+231",
    "flag": "🇱🇷",
    "name": "Либерия"
  },
  {
    "code": "+961",
    "flag": "🇱🇧",
    "name": "Ливан"
  },
  {
    "code": "+218",
    "flag": "🇱🇾",
    "name": "Ливия"
  },
  {
    "code": "+370",
    "flag": "🇱🇹",
    "name": "Литва"
  },
  {
    "code": "+423",
    "flag": "🇱🇮",
    "name": "Лихтенштейн"
  },
  {
    "code": "+352",
    "flag": "🇱🇺",
    "name": "Люксембург"
  },
  {
    "code": "+230",
    "flag": "🇲🇺",
    "name": "Маврикий"
  },
  {
    "code": "+222",
    "flag": "🇲🇷",
    "name": "Мавритания"
  },
  {
    "code": "+261",
    "flag": "🇲🇬",
    "name": "Мадагаскар"
  },
  {
    "code": "+853",
    "flag": "🇲🇴",
    "name": "Макао"
  },
  {
    "code": "+265",
    "flag": "🇲🇼",
    "name": "Малави"
  },
  {
    "code": "+60",
    "flag": "🇲🇾",
    "name": "Малайзия"
  },
  {
    "code": "+223",
    "flag": "🇲🇱",
    "name": "Мали"
  },
  {
    "code": "+960",
    "flag": "🇲🇻",
    "name": "Мальдивы"
  },
  {
    "code": "+356",
    "flag": "🇲🇹",
    "name": "Мальта"
  },
  {
    "code": "+212",
    "flag": "🇲🇦",
    "name": "Марокко"
  },
  {
    "code": "+52",
    "flag": "🇲🇽",
    "name": "Мексика"
  },
  {
    "code": "+691",
    "flag": "🇫🇲",
    "name": "Микронезия"
  },
  {
    "code": "+377",
    "flag": "🇲🇨",
    "name": "Монако"
  },
  {
    "code": "+976",
    "flag": "🇲🇳",
    "name": "Монголия"
  },
  {
    "code": "+382",
    "flag": "🇲🇪",
    "name": "Черногория"
  },
  {
    "code": "+95",
    "flag": "🇲🇲",
    "name": "Мьянма"
  },
  {
    "code": "+264",
    "flag": "🇳🇦",
    "name": "Намибия"
  },
  {
    "code": "+674",
    "flag": "🇳🇷",
    "name": "Науру"
  },
  {
    "code": "+977",
    "flag": "🇳🇵",
    "name": "Непал"
  },
  {
    "code": "+227",
    "flag": "🇳🇪",
    "name": "Нигер"
  },
  {
    "code": "+234",
    "flag": "🇳🇬",
    "name": "Нигерия"
  },
  {
    "code": "+31",
    "flag": "🇳🇱",
    "name": "Нидерланды"
  },
  {
    "code": "+505",
    "flag": "🇳🇮",
    "name": "Никарагуа"
  },
  {
    "code": "+64",
    "flag": "🇳🇿",
    "name": "Новая Зеландия"
  },
  {
    "code": "+47",
    "flag": "🇳🇴",
    "name": "Норвегия"
  },
  {
    "code": "+971",
    "flag": "🇦🇪",
    "name": "ОАЭ"
  },
  {
    "code": "+968",
    "flag": "🇴🇲",
    "name": "Оман"
  },
  {
    "code": "+92",
    "flag": "🇵🇰",
    "name": "Пакистан"
  },
  {
    "code": "+680",
    "flag": "🇵🇼",
    "name": "Палау"
  },
  {
    "code": "+507",
    "flag": "🇵🇦",
    "name": "Панама"
  },
  {
    "code": "+675",
    "flag": "🇵🇬",
    "name": "Папуа — Новая Гвинея"
  },
  {
    "code": "+595",
    "flag": "🇵🇾",
    "name": "Парагвай"
  },
  {
    "code": "+51",
    "flag": "🇵🇪",
    "name": "Перу"
  },
  {
    "code": "+48",
    "flag": "🇵🇱",
    "name": "Польша"
  },
  {
    "code": "+351",
    "flag": "🇵🇹",
    "name": "Португалия"
  },
  {
    "code": "+250",
    "flag": "🇷🇼",
    "name": "Руанда"
  },
  {
    "code": "+40",
    "flag": "🇷🇴",
    "name": "Румыния"
  },
  {
    "code": "+503",
    "flag": "🇸🇻",
    "name": "Сальвадор"
  },
  {
    "code": "+685",
    "flag": "🇼🇸",
    "name": "Самоа"
  },
  {
    "code": "+378",
    "flag": "🇸🇲",
    "name": "Сан-Марино"
  },
  {
    "code": "+239",
    "flag": "🇸🇹",
    "name": "Сан-Томе и Принсипи"
  },
  {
    "code": "+966",
    "flag": "🇸🇦",
    "name": "Саудовская Аравия"
  },
  {
    "code": "+389",
    "flag": "🇲🇰",
    "name": "Северная Македония"
  },
  {
    "code": "+248",
    "flag": "🇸🇨",
    "name": "Сейшелы"
  },
  {
    "code": "+221",
    "flag": "🇸🇳",
    "name": "Сенегал"
  },
  {
    "code": "+1869",
    "flag": "🇰🇳",
    "name": "Сент-Китс и Невис"
  },
  {
    "code": "+1758",
    "flag": "🇱🇨",
    "name": "Сент-Люсия"
  },
  {
    "code": "+1784",
    "flag": "🇻🇨",
    "name": "Сент-Винсент и Гренадины"
  },
  {
    "code": "+381",
    "flag": "🇷🇸",
    "name": "Сербия"
  },
  {
    "code": "+65",
    "flag": "🇸🇬",
    "name": "Сингапур"
  },
  {
    "code": "+963",
    "flag": "🇸🇾",
    "name": "Сирия"
  },
  {
    "code": "+421",
    "flag": "🇸🇰",
    "name": "Словакия"
  },
  {
    "code": "+386",
    "flag": "🇸🇮",
    "name": "Словения"
  },
  {
    "code": "+677",
    "flag": "🇸🇧",
    "name": "Соломоновы Острова"
  },
  {
    "code": "+252",
    "flag": "🇸🇴",
    "name": "Сомали"
  },
  {
    "code": "+249",
    "flag": "🇸🇩",
    "name": "Судан"
  },
  {
    "code": "+597",
    "flag": "🇸🇷",
    "name": "Суринам"
  },
  {
    "code": "+1",
    "flag": "🇺🇸",
    "name": "США"
  },
  {
    "code": "+232",
    "flag": "🇸🇱",
    "name": "Сьерра-Леоне"
  },
  {
    "code": "+886",
    "flag": "🇹🇼",
    "name": "Тайвань"
  },
  {
    "code": "+66",
    "flag": "🇹🇭",
    "name": "Таиланд"
  },
  {
    "code": "+255",
    "flag": "🇹🇿",
    "name": "Танзания"
  },
  {
    "code": "+228",
    "flag": "🇹🇬",
    "name": "Того"
  },
  {
    "code": "+676",
    "flag": "🇹🇴",
    "name": "Тонга"
  },
  {
    "code": "+1868",
    "flag": "🇹🇹",
    "name": "Тринидад и Тобаго"
  },
  {
    "code": "+216",
    "flag": "🇹🇳",
    "name": "Тунис"
  },
  {
    "code": "+90",
    "flag": "🇹🇷",
    "name": "Турция"
  },
  {
    "code": "+993",
    "flag": "🇹🇲",
    "name": "Туркменистан"
  },
  {
    "code": "+688",
    "flag": "🇹🇻",
    "name": "Тувалу"
  },
  {
    "code": "+256",
    "flag": "🇺🇬",
    "name": "Уганда"
  },
  {
    "code": "+598",
    "flag": "🇺🇾",
    "name": "Уругвай"
  },
  {
    "code": "+679",
    "flag": "🇫🇯",
    "name": "Фиджи"
  },
  {
    "code": "+63",
    "flag": "🇵🇭",
    "name": "Филиппины"
  },
  {
    "code": "+358",
    "flag": "🇫🇮",
    "name": "Финляндия"
  },
  {
    "code": "+33",
    "flag": "🇫🇷",
    "name": "Франция"
  },
  {
    "code": "+385",
    "flag": "🇭🇷",
    "name": "Хорватия"
  },
  {
    "code": "+236",
    "flag": "🇨🇫",
    "name": "ЦАР"
  },
  {
    "code": "+235",
    "flag": "🇹🇩",
    "name": "Чад"
  },
  {
    "code": "+420",
    "flag": "🇨🇿",
    "name": "Чехия"
  },
  {
    "code": "+56",
    "flag": "🇨🇱",
    "name": "Чили"
  },
  {
    "code": "+41",
    "flag": "🇨🇭",
    "name": "Швейцария"
  },
  {
    "code": "+46",
    "flag": "🇸🇪",
    "name": "Швеция"
  },
  {
    "code": "+94",
    "flag": "🇱🇰",
    "name": "Шри-Ланка"
  },
  {
    "code": "+593",
    "flag": "🇪🇨",
    "name": "Эквадор"
  },
  {
    "code": "+240",
    "flag": "🇬🇶",
    "name": "Экваториальная Гвинея"
  },
  {
    "code": "+291",
    "flag": "🇪🇷",
    "name": "Эритрея"
  },
  {
    "code": "+268",
    "flag": "🇸🇿",
    "name": "Эсватини"
  },
  {
    "code": "+372",
    "flag": "🇪🇪",
    "name": "Эстония"
  },
  {
    "code": "+251",
    "flag": "🇪🇹",
    "name": "Эфиопия"
  },
  {
    "code": "+27",
    "flag": "🇿🇦",
    "name": "ЮАР"
  },
  {
    "code": "+82",
    "flag": "🇰🇷",
    "name": "Южная Корея"
  },
  {
    "code": "+1876",
    "flag": "🇯🇲",
    "name": "Ямайка"
  },
  {
    "code": "+81",
    "flag": "🇯🇵",
    "name": "Япония"
  }
];

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Standard login fields
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone registration fields
  const [phoneCode, setPhoneCode] = useState(COUNTRIES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [codeStep, setCodeStep] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: authenticate, user, isInitialized } = useAuth();
  const navigate = useNavigate();
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInitialized && user) {
      navigate('/');
    }
  }, [isInitialized, user, navigate]);
  
  useEffect(() => {
      if (showCountrySelect && searchInputRef.current) {
          searchInputRef.current.focus();
      } else {
          setSearchQuery('');
      }
  }, [showCountrySelect]);

  const filteredCountries = useMemo(() => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return COUNTRIES;
      return COUNTRIES.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.code.includes(query)
      );
  }, [searchQuery]);

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { login: loginField, password } : { username: loginField, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.success) {
        authenticate(data.user);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          const fullPhone = phoneCode + phoneNumber.replace(/[^0-9]/g, '');
          const res = await fetch('/api/auth/request-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: fullPhone })
          });
          const data = await res.json();
          if (data.success) {
              setVerifyToken(data.token);
              setCodeStep(true);
          } else {
              setError(data.message);
          }
      } catch (err) {
          setError('Ошибка соединения');
      } finally {
          setLoading(false);
      }
  };

  const handleVerifyCode = async (enteredCode: string) => {
      if (enteredCode.length !== 5) return;
      setLoading(true);
      setError('');
      try {
          const res = await fetch('/api/auth/verify-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: verifyToken, code: enteredCode })
          });
          const data = await res.json();
          if (data.success) {
              authenticate(data.user);
              navigate('/');
          } else {
              setError(data.message);
              setVerifyCode(''); // reset on error
          }
      } catch (err) {
          setError('Ошибка соединения');
      } finally {
          setLoading(false);
      }
  };

  const handleDial = (digit: string) => {
      if (verifyCode.length < 5) {
          const newCode = verifyCode + digit;
          setVerifyCode(newCode);
          if (newCode.length === 5) {
              handleVerifyCode(newCode);
          }
      }
  };
  
  const handleBackspace = () => {
      setVerifyCode(prev => prev.slice(0, -1));
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-glass border border-glass-border rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            layout
            className="w-14 h-14 bg-brand-purple/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-purple/30 shadow-[0_0_30px_rgba(122,27,242,0.3)]"
          >
            <Send className="w-7 h-7 text-white -ml-1 mt-1" />
          </motion.div>
          
          <motion.h1 layout className="text-2xl font-medium mb-2 text-center">
            {mode === 'login' ? 'Вход' :
             mode === 'register_standard' ? 'Регистрация' :
             codeStep ? 'Введите код' : 'Вход по телефону'}
          </motion.h1>
          <motion.p layout className="text-white/50 mb-6 text-center text-sm">
            {mode === 'login' ? 'Войдите по логину или паролю' :
             mode === 'register_standard' ? 'Создайте новый аккаунт' :
             codeStep ? 'Мы отправили код в Telegram бота' : 'Введите номер, который вы привязали в Telegram'}
          </motion.p>

          <AnimatePresence mode="wait">
              {mode === 'register_phone' ? (
                  !codeStep ? (
                      <motion.form 
                          key="phone-form"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleRequestCode} 
                          className="w-full space-y-4"
                      >
                          <div className="relative z-20 flex gap-2">
                              <div className="relative">
                                  <button 
                                      type="button" 
                                      onClick={() => setShowCountrySelect(!showCountrySelect)}
                                      className="h-12 px-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-2 hover:bg-white/10 transition-colors w-[100px]"
                                  >
                                      <span>{COUNTRIES.find(c => c.code === phoneCode)?.flag}</span>
                                      <span className="text-sm">{phoneCode}</span>
                                      <ChevronDown className="w-4 h-4 text-white/50" />
                                  </button>
                                  <AnimatePresence>
                                      {showCountrySelect && (
                                          <>
                                          <div className="fixed inset-0 z-40" onClick={() => setShowCountrySelect(false)} />
                                          <motion.div 
                                              initial={{ opacity: 0, y: -10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: -10 }}
                                              className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-hidden flex flex-col bg-[#1a0f2e] border border-white/10 rounded-xl shadow-xl z-50"
                                          >
                                              <div className="p-3 border-b border-white/10 shrink-0">
                                                  <div className="relative">
                                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                      <input
                                                          ref={searchInputRef}
                                                          type="text"
                                                          placeholder="Поиск страны или кода"
                                                          value={searchQuery}
                                                          onChange={(e) => setSearchQuery(e.target.value)}
                                                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-purple transition-colors"
                                                      />
                                                  </div>
                                              </div>
                                              <div className="overflow-y-auto flex-1 p-1 scrollbar-thin">
                                                  {filteredCountries.length > 0 ? filteredCountries.map(c => (
                                                      <button
                                                          key={c.name + c.code}
                                                          type="button"
                                                          onClick={() => { setPhoneCode(c.code); setShowCountrySelect(false); }}
                                                          className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                                                      >
                                                          <span className="text-xl">{c.flag}</span>
                                                          <div className="flex flex-col">
                                                              <span className="text-sm font-medium">{c.name}</span>
                                                              <span className="text-xs text-white/50">{c.code}</span>
                                                          </div>
                                                      </button>
                                                  )) : (
                                                      <div className="p-4 text-center text-white/50 text-sm">Ничего не найдено</div>
                                                  )}
                                              </div>
                                          </motion.div>
                                          </>
                                      )}
                                  </AnimatePresence>
                              </div>
                              <Input
                                  type="tel"
                                  placeholder="Номер телефона"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  className="flex-1"
                                  required
                              />
                          </div>

                          <AnimatePresence>
                              {error && (
                                  <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="text-center overflow-hidden"
                                  >
                                      <p className="text-red-400 text-sm mb-2">{error}</p>
                                      {error.includes('@') && (
                                          <Button type="button" onClick={() => window.open('https://t.me/Testgrgegeammbot', '_blank')} className="w-full mb-2 bg-[#2AABEE] text-white hover:bg-[#229ED9] border-none shadow-[0_0_20px_rgba(42,171,238,0.3)]">
                                              Открыть бота
                                          </Button>
                                      )}
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <Button type="submit" className="w-full justify-between px-6" loading={loading}>
                              <span>Получить код</span>
                              <ArrowRight className="w-5 h-5" />
                          </Button>
                      </motion.form>
                  ) : (
                      <motion.div 
                          key="code-form"
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -40 }}
                          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                          className="w-full flex flex-col items-center"
                      >
                          <div className="flex gap-2 sm:gap-4 mb-8">
                              {[0, 1, 2, 3, 4].map(index => {
                                  const isActive = verifyCode.length === index;
                                  const digit = verifyCode[index] || '';
                                  return (
                                      <motion.div
                                          key={index}
                                          animate={{ 
                                              y: isActive ? -8 : 0,
                                              scale: isActive ? 1.05 : 1,
                                              borderColor: isActive ? 'rgba(122,27,242,0.8)' : digit ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
                                          }}
                                          className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-2xl font-bold rounded-xl border bg-white/5 backdrop-blur-md"
                                      >
                                          {digit}
                                      </motion.div>
                                  );
                              })}
                          </div>
                          
                          <AnimatePresence>
                              {error && (
                                  <motion.p
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="text-red-400 text-sm mb-4"
                                  >
                                      {error}
                                  </motion.p>
                              )}
                          </AnimatePresence>

                          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[280px]">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                  <button
                                      key={num}
                                      onClick={() => handleDial(num.toString())}
                                      disabled={loading}
                                      className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all text-2xl font-medium border border-white/5 flex items-center justify-center"
                                  >
                                      {num}
                                  </button>
                              ))}
                              <div />
                              <button
                                  onClick={() => handleDial('0')}
                                  disabled={loading}
                                  className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all text-2xl font-medium border border-white/5 flex items-center justify-center"
                              >
                                  0
                              </button>
                              <button
                                  onClick={handleBackspace}
                                  disabled={loading}
                                  className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all text-2xl font-medium border border-white/5 flex items-center justify-center text-white/50 hover:text-white"
                              >
                                  <Delete className="w-7 h-7" />
                              </button>
                          </div>
                          
                          <button 
                              onClick={() => { setCodeStep(false); setVerifyCode(''); setError(''); }}
                              className="mt-6 text-sm text-white/50 hover:text-white transition-colors"
                          >
                              Изменить номер телефона
                          </button>
                      </motion.div>
                  )
              ) : (
                  <motion.form 
                      key="standard-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleStandardAuth} 
                      className="w-full space-y-4"
                  >
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <Input
                          type="text"
                          placeholder={mode === 'login' ? "Логин или Телефон" : "Логин"}
                          value={loginField}
                          onChange={(e) => setLoginField(e.target.value)}
                          className="pl-12"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Пароль"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-center overflow-hidden"
                          >
                            <p className="text-red-400 text-sm mb-2">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="pt-2">
                        <Button type="submit" className="w-full justify-between px-6" loading={loading}>
                          <span>{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                  </motion.form>
              )}
          </AnimatePresence>

          <motion.div layout className="mt-6 flex flex-col gap-3 w-full items-center">
            {mode === 'login' ? (
                <>
                    <button onClick={() => { setMode('register_standard'); setError(''); }} className="text-sm text-white/50 hover:text-white transition-colors">
                        Нет аккаунта? Зарегистрироваться
                    </button>
                    <button onClick={() => { setMode('register_phone'); setError(''); }} className="text-sm text-brand-purple font-medium flex justify-center items-center gap-2 hover:brightness-125 transition-all">
                        <Phone className="w-4 h-4" /> Вход по телефону (SMS код)
                    </button>
                </>
            ) : mode === 'register_standard' ? (
                <>
                    <button onClick={() => { setMode('login'); setError(''); }} className="text-sm text-white/50 hover:text-white transition-colors">
                        Уже есть аккаунт? Войти
                    </button>
                    <button onClick={() => { setMode('register_phone'); setError(''); }} className="text-sm text-brand-purple font-medium flex justify-center items-center gap-2 hover:brightness-125 transition-all">
                        <Phone className="w-4 h-4" /> Вход по телефону
                    </button>
                </>
            ) : (
                <button onClick={() => { setMode('login'); setError(''); setCodeStep(false); setVerifyCode(''); }} className="text-sm text-white/50 hover:text-white transition-colors">
                    Войти по логину и паролю
                </button>
            )}
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
