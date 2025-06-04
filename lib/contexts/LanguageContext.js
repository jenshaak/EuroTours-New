'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Translation objects
const translations = {
  en: {
    // Navigation & Common
    back: "Back",
    home: "Home",
    selectLanguage: "Select Language",
    
    // Homepage
    discoverEurope: "Discover Europe",
    heroSubtitle: "Book your perfect European bus journey with the best prices and most reliable carriers. Travel comfortably across the continent.",
    bestPrices: "Best Prices",
    bestPricesDesc: "We compare prices from multiple carriers to get you the best deals on European bus travel.",
    multipleCarriers: "Multiple Carriers",
    multipleCarriersDesc: "Choose from top European bus companies including FlixBus, Eurolines, and more.",
    support247: "24/7 Support",
    support247Desc: "Our customer support team is available around the clock to help with your travel needs.",
    popularDestinations: "Popular Destinations",
    
    // Search Form
    findPerfectRoute: "Find Your Perfect Bus Route",
    comparePrices: "We compare prices from multiple carriers to get you the best deals",
    from: "From",
    to: "To",
    selectDepartureCity: "Select departure city",
    selectDestinationCity: "Select destination city",
    returnTicket: "Return ticket",
    departureDate: "Departure Date",
    returnDate: "Return Date",
    selectDate: "Select date",
    findTickets: "Find Tickets",
    loading: "Loading...",
    
    // Booking Page
    tripSummary: "Trip Summary",
    duration: "Duration",
    totalPrice: "Total Price",
    direct: "Direct",
    passengerInfo: "Passenger Information",
    fullName: "Full Name",
    enterFullName: "Enter your full name",
    emailAddress: "Email Address",
    enterEmail: "Enter your email",
    phoneNumber: "Phone Number",
    enterPhone: "Enter your phone number",
    dateOfBirth: "Date of Birth",
    idPassport: "ID/Passport Number",
    enterIdPassport: "Enter your ID or passport number",
    paymentMethod: "Payment Method",
    payWithCard: "Pay with Card",
    payWithCrypto: "Pay with Cryptocurrency",
    selectCrypto: "Select Cryptocurrency",
    chooseCrypto: "Choose your preferred cryptocurrency for payment:",
    cancel: "Cancel",
    continue: "Continue",
    creating: "Creating...",
    
    // Footer
    quickLinks: "Quick Links",
    searchRoutes: "Search Routes",
    aboutUs: "About Us",
    faq: "FAQ",
    helpCenter: "Help Center",
    busCompanies: "Bus Companies",
    support: "Support",
    contactUs: "Contact Us",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    allRightsReserved: "All rights reserved.",
    trustedPartner: "Your trusted partner for European bus travel. Connecting cities across the continent with comfort and reliability.",
    
    // Error Messages
    selectCities: "Please select both departure and destination cities.",
    selectDepartureDate: "Please select a departure date.",
    selectReturnDate: "Please select a return date for round-trip tickets.",
    searchFailed: "Search failed. Please try again.",
    fillRequired: "Please fill in all required fields",
    loadingBooking: "Loading booking details...",
    routeNotFound: "Route not found",
    backToSearch: "Back to Search",
    
    // Search Results Page
    searchResults: "Search Results",
    foundRoutes: "Found",
    route: "route",
    routes: "routes",
    outboundReturn: "(outbound + return)",
    checkingExternalProviders: "Checking external providers...",
    providersLoading: "loading...",
    provider: "provider",
    providers: "providers",
    outboundJourney: "Outbound Journey",
    returnJourney: "Return Journey",
    noRoutesFound: "No routes found",
    noRoutesMessage: "We couldn't find any routes for your search criteria. Try adjusting your dates or destinations.",
    newSearch: "New Search"
  },
  cs: {
    // Navigation & Common
    back: "Zpět",
    home: "Domů",
    selectLanguage: "Vybrat jazyk",
    
    // Homepage
    discoverEurope: "Objevte Evropu",
    heroSubtitle: "Rezervujte si svou dokonalou evropskou autobusovou cestu s nejlepšími cenami a nejspolehlivějšími dopravci. Cestujte pohodlně napříč kontinentem.",
    bestPrices: "Nejlepší ceny",
    bestPricesDesc: "Porovnáváme ceny od více dopravců, abychom vám poskytli nejlepší nabídky pro cestování autobusem po Evropě.",
    multipleCarriers: "Více dopravců",
    multipleCarriersDesc: "Vyberte si z předních evropských autobusových společností včetně FlixBus, Eurolines a dalších.",
    support247: "Podpora 24/7",
    support247Desc: "Náš tým zákaznické podpory je k dispozici nepřetržitě, aby vám pomohl s vašimi cestovními potřebami.",
    popularDestinations: "Oblíbené destinace",
    
    // Search Form
    findPerfectRoute: "Najděte svou ideální autobusovou trasu",
    comparePrices: "Porovnáváme ceny od více dopravců, abychom vám poskytli nejlepší nabídky",
    from: "Z",
    to: "Do",
    selectDepartureCity: "Vyberte město odjezdu",
    selectDestinationCity: "Vyberte cílové město",
    returnTicket: "Zpáteční jízdenka",
    departureDate: "Datum odjezdu",
    returnDate: "Datum návratu",
    selectDate: "Vyberte datum",
    findTickets: "Najít jízdenky",
    loading: "Načítání...",
    
    // Booking Page
    tripSummary: "Souhrn cesty",
    duration: "Doba trvání",
    totalPrice: "Celková cena",
    direct: "Přímé",
    passengerInfo: "Informace o cestujícím",
    fullName: "Celé jméno",
    enterFullName: "Zadejte své celé jméno",
    emailAddress: "E-mailová adresa",
    enterEmail: "Zadejte svůj e-mail",
    phoneNumber: "Telefonní číslo",
    enterPhone: "Zadejte své telefonní číslo",
    dateOfBirth: "Datum narození",
    idPassport: "Číslo OP/pasu",
    enterIdPassport: "Zadejte číslo OP nebo pasu",
    paymentMethod: "Způsob platby",
    payWithCard: "Platba kartou",
    payWithCrypto: "Platba kryptoměnou",
    selectCrypto: "Vyberte kryptoměnu",
    chooseCrypto: "Vyberte preferovanou kryptoměnu pro platbu:",
    cancel: "Zrušit",
    continue: "Pokračovat",
    creating: "Vytváření...",
    
    // Footer
    quickLinks: "Rychlé odkazy",
    searchRoutes: "Hledat trasy",
    aboutUs: "O nás",
    faq: "Často kladené otázky",
    helpCenter: "Centrum nápovědy",
    busCompanies: "Autobusové společnosti",
    support: "Podpora",
    contactUs: "Kontaktujte nás",
    termsOfService: "Podmínky služby",
    privacyPolicy: "Zásady ochrany osobních údajů",
    allRightsReserved: "Všechna práva vyhrazena.",
    trustedPartner: "Váš důvěryhodný partner pro cestování autobusem po Evropě. Propojujeme města napříč kontinentem s pohodlím a spolehlivostí.",
    
    // Error Messages
    selectCities: "Vyberte prosím města odjezdu i příjezdu.",
    selectDepartureDate: "Vyberte prosím datum odjezdu.",
    selectReturnDate: "Vyberte prosím datum návratu pro zpáteční jízdenky.",
    searchFailed: "Vyhledávání selhalo. Zkuste to prosím znovu.",
    fillRequired: "Vyplňte prosím všechna povinná pole",
    loadingBooking: "Načítání údajů o rezervaci...",
    routeNotFound: "Trasa nenalezena",
    backToSearch: "Zpět na vyhledávání",
    
    // Search Results Page
    searchResults: "Výsledky hledání",
    foundRoutes: "Nalezeno",
    route: "trasa",
    routes: "trasy",
    outboundReturn: "(tam a zpátky)",
    checkingExternalProviders: "Kontroluji externí poskytovatele...",
    providersLoading: "načítání...",
    provider: "poskytovatel",
    providers: "poskytovatelé",
    outboundJourney: "Cesta tam",
    returnJourney: "Cesta zpátky",
    noRoutesFound: "Žádné trasy nebyly nalezeny",
    noRoutesMessage: "Nepodařilo se nalézt žádné trasy pro vaše kritéria vyhledávání. Zkuste upravit své datumy nebo destinace.",
    newSearch: "Nové hledání"
  },
  bg: {
    // Navigation & Common
    back: "Назад",
    home: "Начало",
    selectLanguage: "Избери език",
    
    // Homepage
    discoverEurope: "Открийте Европа",
    heroSubtitle: "Резервирайте вашето перфектно европейско автобусно пътуване с най-добрите цени и най-надеждните превозвачи. Пътувайте удобно през континента.",
    bestPrices: "Най-добри цени",
    bestPricesDesc: "Сравняваме цени от множество превозвачи, за да ви предложим най-добрите оферти за автобусно пътуване в Европа.",
    multipleCarriers: "Множество превозвачи",
    multipleCarriersDesc: "Изберете от водещи европейски автобусни компании, включително FlixBus, Eurolines и други.",
    support247: "Поддръжка 24/7",
    support247Desc: "Нашият екип за обслужване на клиенти е на разположение денонощно, за да помогне с вашите пътни нужди.",
    popularDestinations: "Популярни дестинации",
    
    // Search Form
    findPerfectRoute: "Намерете вашия перфектен автобусен маршрут",
    comparePrices: "Сравняваме цени от множество превозвачи, за да ви предложим най-добрите оферти",
    from: "От",
    to: "До",
    selectDepartureCity: "Изберете град на заминаване",
    selectDestinationCity: "Изберете град на пристигане",
    returnTicket: "Билет за връщане",
    departureDate: "Дата на заминаване",
    returnDate: "Дата на връщане",
    selectDate: "Изберете дата",
    findTickets: "Намери билети",
    loading: "Зареждане...",
    
    // Booking Page
    tripSummary: "Обобщение на пътуването",
    duration: "Продължителност",
    totalPrice: "Обща цена",
    direct: "Директно",
    passengerInfo: "Информация за пътника",
    fullName: "Пълно име",
    enterFullName: "Въведете пълното си име",
    emailAddress: "Имейл адрес",
    enterEmail: "Въведете своя имейл",
    phoneNumber: "Телефонен номер",
    enterPhone: "Въведете телефонния си номер",
    dateOfBirth: "Дата на раждане",
    idPassport: "Номер на ЛК/паспорт",
    enterIdPassport: "Въведете номера на ЛК или паспорт",
    paymentMethod: "Начин на плащане",
    payWithCard: "Плащане с карта",
    payWithCrypto: "Плащане с криптовалута",
    selectCrypto: "Изберете криптовалута",
    chooseCrypto: "Изберете предпочитаната си криптовалута за плащане:",
    cancel: "Отказ",
    continue: "Продължи",
    creating: "Създаване...",
    
    // Footer
    quickLinks: "Бързи връзки",
    searchRoutes: "Търсене на маршрути",
    aboutUs: "За нас",
    faq: "Често задавани въпроси",
    helpCenter: "Център за помощ",
    busCompanies: "Автобусни компании",
    support: "Поддръжка",
    contactUs: "Свържете се с нас",
    termsOfService: "Условия за ползване",
    privacyPolicy: "Политика за поверителност",
    allRightsReserved: "Всички права запазени.",
    trustedPartner: "Вашият доверен партньор за автобусно пътуване в Европа. Свързваме градове в континента с комфорт и надеждност.",
    
    // Error Messages
    selectCities: "Моля, изберете и двата града - за заминаване и пристигане.",
    selectDepartureDate: "Моля, изберете дата на заминаване.",
    selectReturnDate: "Моля, изберете дата на връщане за билети за двупосочно пътуване.",
    searchFailed: "Търсенето неуспешно. Моля, опитайте отново.",
    fillRequired: "Моля, попълнете всички задължителни полета",
    loadingBooking: "Зареждане на данни за резервацията...",
    routeNotFound: "Маршрутът не е намерен",
    backToSearch: "Обратно към търсенето",
    
    // Search Results Page
    searchResults: "Резултати от търсене",
    foundRoutes: "Намерени",
    route: "маршрут",
    routes: "маршрути",
    outboundReturn: "(туда и обратно)",
    checkingExternalProviders: "Проверяваме външни доставчици...",
    providersLoading: "зареждане...",
    provider: "доставчик",
    providers: "доставчици",
    outboundJourney: "Пътуване туда",
    returnJourney: "Пътуване обратно",
    noRoutesFound: "Няма намерени маршрути",
    noRoutesMessage: "Не можахме да намерим маршрути за вашите критерии за търсене. Опитайте да промените датите или дестинациите.",
    newSearch: "Ново търсене"
  },
  ru: {
    // Navigation & Common
    back: "Назад",
    home: "Главная",
    selectLanguage: "Выберите язык",
    
    // Homepage
    discoverEurope: "Откройте Европу",
    heroSubtitle: "Забронируйте ваше идеальное европейское автобусное путешествие с лучшими ценами и самыми надежными перевозчиками. Путешествуйте комфортно по континенту.",
    bestPrices: "Лучшие цены",
    bestPricesDesc: "Мы сравниваем цены от нескольких перевозчиков, чтобы предложить вам лучшие предложения для автобусного путешествия по Европе.",
    multipleCarriers: "Множество перевозчиков",
    multipleCarriersDesc: "Выбирайте из ведущих европейских автобусных компаний, включая FlixBus, Eurolines и другие.",
    support247: "Поддержка 24/7",
    support247Desc: "Наша команда поддержки клиентов доступна круглосуточно, чтобы помочь с вашими потребностями в путешествии.",
    popularDestinations: "Популярные направления",
    
    // Search Form
    findPerfectRoute: "Найдите ваш идеальный автобусный маршрут",
    comparePrices: "Мы сравниваем цены от нескольких перевозчиков, чтобы предложить вам лучшие предложения",
    from: "Откуда",
    to: "Куда",
    selectDepartureCity: "Выберите город отправления",
    selectDestinationCity: "Выберите город назначения",
    returnTicket: "Обратный билет",
    departureDate: "Дата отправления",
    returnDate: "Дата возвращения",
    selectDate: "Выберите дату",
    findTickets: "Найти билеты",
    loading: "Загрузка...",
    
    // Booking Page
    tripSummary: "Сводка поездки",
    duration: "Продолжительность",
    totalPrice: "Общая цена",
    direct: "Прямой",
    passengerInfo: "Информация о пассажире",
    fullName: "Полное имя",
    enterFullName: "Введите ваше полное имя",
    emailAddress: "Адрес электронной почты",
    enterEmail: "Введите ваш email",
    phoneNumber: "Номер телефона",
    enterPhone: "Введите ваш номер телефона",
    dateOfBirth: "Дата рождения",
    idPassport: "Номер удостоверения/паспорта",
    enterIdPassport: "Введите номер удостоверения или паспорта",
    paymentMethod: "Способ оплаты",
    payWithCard: "Оплата картой",
    payWithCrypto: "Оплата криптовалютой",
    selectCrypto: "Выберите криптовалюту",
    chooseCrypto: "Выберите предпочитаемую криптовалюту для оплаты:",
    cancel: "Отмена",
    continue: "Продолжить",
    creating: "Создание...",
    
    // Footer
    quickLinks: "Быстрые ссылки",
    searchRoutes: "Поиск маршрутов",
    aboutUs: "О нас",
    faq: "Часто задаваемые вопросы",
    helpCenter: "Центр помощи",
    busCompanies: "Автобусные компании",
    support: "Поддержка",
    contactUs: "Связаться с нами",
    termsOfService: "Условия обслуживания",
    privacyPolicy: "Политика конфиденциальности",
    allRightsReserved: "Все права защищены.",
    trustedPartner: "Ваш надежный партнер для автобусного путешествия по Европе. Соединяем города по всему континенту с комфортом и надежностью.",
    
    // Error Messages
    selectCities: "Пожалуйста, выберите города отправления и назначения.",
    selectDepartureDate: "Пожалуйста, выберите дату отправления.",
    selectReturnDate: "Пожалуйста, выберите дату возвращения для билетов туда и обратно.",
    searchFailed: "Поиск не удался. Пожалуйста, попробуйте еще раз.",
    fillRequired: "Пожалуйста, заполните все обязательные поля",
    loadingBooking: "Загрузка данных бронирования...",
    routeNotFound: "Маршрут не найден",
    backToSearch: "Вернуться к поиску",
    
    // Search Results Page
    searchResults: "Результаты поиска",
    foundRoutes: "Найдено",
    route: "маршрут",
    routes: "маршрута",
    outboundReturn: "(туда и обратно)",
    checkingExternalProviders: "Проверяем внешних поставщиков...",
    providersLoading: "загрузка...",
    provider: "поставщик",
    providers: "поставщика",
    outboundJourney: "Путешествие туда",
    returnJourney: "Обратное путешествие",
    noRoutesFound: "Маршруты не найдены",
    noRoutesMessage: "Мы не смогли найти маршруты для ваших критериев поиска. Попробуйте изменить даты или направления.",
    newSearch: "Новый поиск"
  }
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'cs', name: 'Čeština' },
  { code: 'bg', name: 'Български' },
  { code: 'ru', name: 'Русский' }
]

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('eurotours-language')
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('eurotours-language', currentLanguage)
  }, [currentLanguage])

  const t = translations[currentLanguage]

  const value = {
    currentLanguage,
    setCurrentLanguage,
    t,
    languages,
    translations
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 