import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eurotours'

async function initializeCompleteDatabase() {
  console.log('🚀 Initializing complete EuroTours database with all cities...')
  
  const client = new MongoClient(DATABASE_URL)
  
  try {
    await client.connect()
    const db = client.db('eurotours')
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      db.collection('countries').deleteMany({}),
      db.collection('cities').deleteMany({}),
      db.collection('carriers').deleteMany({}),
      db.collection('routes').deleteMany({}),
      db.collection('searches').deleteMany({})
    ])
    
    // Create indexes
    console.log('📚 Creating database indexes...')
    await createIndexes(db)
    
    // Insert all countries
    console.log('🌍 Inserting all countries...')
    await insertAllCountries(db)
    
    // Insert all cities
    console.log('🏙️ Inserting all cities...')
    await insertAllCities(db)
    
    // Insert carriers
    console.log('🚌 Inserting carriers...')
    await insertCarriers(db)
    
    console.log('✅ Complete database initialization completed!')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  } finally {
    await client.close()
  }
}

async function createIndexes(db) {
  // Cities collection indexes
  await db.collection('cities').createIndex({ isActive: 1 })
  await db.collection('cities').createIndex({ countryId: 1 })
  await db.collection('cities').createIndex({ 
    "names.en": "text", 
    "names.cs": "text", 
    "names.bg": "text", 
    "names.ru": "text", 
    "names.uk": "text",
    "variations": "text"
  })

  // Routes collection indexes
  await db.collection('routes').createIndex({ searchId: 1 })
  await db.collection('routes').createIndex({ fromCityId: 1, toCityId: 1 })
  await db.collection('routes').createIndex({ departureTime: 1 })
  await db.collection('routes').createIndex({ isExternal: 1 })
  await db.collection('routes').createIndex({ carrierId: 1 })
  
  // TTL index - routes expire after 1 hour
  await db.collection('routes').createIndex(
    { createdAt: 1 }, 
    { expireAfterSeconds: 3600 }
  )

  // Searches collection indexes
  await db.collection('searches').createIndex({ fromCityId: 1, toCityId: 1 })
  
  // TTL index - searches expire after 24 hours
  await db.collection('searches').createIndex(
    { createdAt: 1 }, 
    { expireAfterSeconds: 86400 }
  )

  // Countries collection indexes
  await db.collection('countries').createIndex({ code: 1 })
  await db.collection('countries').createIndex({ isActive: 1 })

  // Carriers collection indexes
  await db.collection('carriers').createIndex({ code: 1 })
  await db.collection('carriers').createIndex({ isExternal: 1 })
  await db.collection('carriers').createIndex({ isActive: 1 })
}

async function insertAllCountries(db) {
  const countries = [
    // Original countries
    { id: 1, code: "CZ", names: { en: "Czech Republic", cs: "Česká republika", bg: "Чешка република", ru: "Чешская Республика", uk: "Чеська Республіка" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, code: "DE", names: { en: "Germany", cs: "Německo", bg: "Германия", ru: "Германия", uk: "Німеччина" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, code: "AT", names: { en: "Austria", cs: "Rakousko", bg: "Австрия", ru: "Австрия", uk: "Австрія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, code: "PL", names: { en: "Poland", cs: "Polsko", bg: "Полша", ru: "Польша", uk: "Польща" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, code: "HU", names: { en: "Hungary", cs: "Maďarsko", bg: "Унгария", ru: "Венгрия", uk: "Угорщина" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 6, code: "SK", names: { en: "Slovakia", cs: "Slovensko", bg: "Словакия", ru: "Словакия", uk: "Словаччина" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Additional countries
    { id: 7, code: "GB", names: { en: "United Kingdom", cs: "Velká Británie", bg: "Великобритания", ru: "Великобритания", uk: "Великобританія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 8, code: "BE", names: { en: "Belgium", cs: "Belgie", bg: "Белгия", ru: "Бельгия", uk: "Бельгія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 9, code: "BY", names: { en: "Belarus", cs: "Bělorusko", bg: "Беларус", ru: "Беларусь", uk: "Білорусь" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 10, code: "BG", names: { en: "Bulgaria", cs: "Bulharsko", bg: "България", ru: "Болгария", uk: "Болгарія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 11, code: "DK", names: { en: "Denmark", cs: "Dánsko", bg: "Дания", ru: "Дания", uk: "Данія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 12, code: "EE", names: { en: "Estonia", cs: "Estonsko", bg: "Естония", ru: "Эстония", uk: "Естонія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 13, code: "FI", names: { en: "Finland", cs: "Finsko", bg: "Финландия", ru: "Финляндия", uk: "Фінляндія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 14, code: "FR", names: { en: "France", cs: "Francie", bg: "Франция", ru: "Франция", uk: "Франція" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 15, code: "NL", names: { en: "Netherlands", cs: "Nizozemsko", bg: "Нидерландия", ru: "Нидерланды", uk: "Нідерланди" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 16, code: "HR", names: { en: "Croatia", cs: "Chorvatsko", bg: "Хърватия", ru: "Хорватия", uk: "Хорватія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 17, code: "IT", names: { en: "Italy", cs: "Itálie", bg: "Италия", ru: "Италия", uk: "Італія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 18, code: "LT", names: { en: "Lithuania", cs: "Litva", bg: "Литва", ru: "Литва", uk: "Литва" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 19, code: "LV", names: { en: "Latvia", cs: "Lotyšsko", bg: "Латвия", ru: "Латвия", uk: "Латвія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 20, code: "LU", names: { en: "Luxembourg", cs: "Lucembursko", bg: "Люксембург", ru: "Люксембург", uk: "Люксембург" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 21, code: "MK", names: { en: "North Macedonia", cs: "Severní Makedonie", bg: "Северна Македония", ru: "Северная Македония", uk: "Північна Македонія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 22, code: "MD", names: { en: "Moldova", cs: "Moldavsko", bg: "Молдова", ru: "Молдова", uk: "Молдова" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 23, code: "NO", names: { en: "Norway", cs: "Norsko", bg: "Норвегия", ru: "Норвегия", uk: "Норвегія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 24, code: "RO", names: { en: "Romania", cs: "Rumunsko", bg: "Румъния", ru: "Румыния", uk: "Румунія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 25, code: "RU", names: { en: "Russia", cs: "Rusko", bg: "Русия", ru: "Россия", uk: "Росія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 26, code: "GR", names: { en: "Greece", cs: "Řecko", bg: "Гърция", ru: "Греция", uk: "Греція" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 27, code: "RS", names: { en: "Serbia", cs: "Srbsko", bg: "Сърбия", ru: "Сербия", uk: "Сербія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 28, code: "ES", names: { en: "Spain", cs: "Španělsko", bg: "Испания", ru: "Испания", uk: "Іспанія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 29, code: "SE", names: { en: "Sweden", cs: "Švédsko", bg: "Швеция", ru: "Швеция", uk: "Швеція" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 30, code: "CH", names: { en: "Switzerland", cs: "Švýcarsko", bg: "Швейцария", ru: "Швейцария", uk: "Швейцарія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 31, code: "TR", names: { en: "Turkey", cs: "Turecko", bg: "Турция", ru: "Турция", uk: "Туреччина" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 32, code: "UA", names: { en: "Ukraine", cs: "Ukrajina", bg: "Украйна", ru: "Украина", uk: "Україна" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 33, code: "SI", names: { en: "Slovenia", cs: "Slovinsko", bg: "Словения", ru: "Словения", uk: "Словенія" }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 34, code: "BA", names: { en: "Bosnia and Herzegovina", cs: "Bosna a Hercegovina", bg: "Босна и Херцеговина", ru: "Босния и Герцеговина", uk: "Боснія і Герцеговина" }, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]

  await db.collection('countries').insertMany(countries)
  console.log(`✅ Inserted ${countries.length} countries`)
}

async function insertAllCities(db) {
  let cityId = 1
  
  const cityMappings = {
    // Czech Republic (1)
    1: ["Ostrava", "Frýdek-Místek", "Brno", "Praha", "Nový Jičín", "Olomouc", "Plzeň", "Hradec Králové", "Ústí nad Labem", "Znojmo", "Karlovy Vary", "Jičín", "Mladá Boleslav", "Bílá", "České Budějovice", "Příbram", "Dobříš", "Uherský Brod", "Uherské Hradiště", "Valašské Meziříčí", "Liberec", "Prostějov", "Kolin", "Jihlava", "Humpolec", "Cheb", "Nachod", "Český Krumlov", "Jablonec n. Nisou", "Železný Brod", "Turnov", "Chomutov", "Louny", "Slany", "Benesov", "Rokycany", "Pardubice", "Pisek", "Vernovice", "Kladno", "Podebrady", "Vysoké Mýto", "Teplice", "Břeclav"],
    
    // Germany (2)
    2: ["Regensburg", "Munich", "Augsburg", "Gunzburg", "Ulm", "Stuttgart", "Dresden", "Berlin", "Nurnberg", "Frankfurt", "Koln", "Aachen", "Hamburg", "Hannover", "Leipzig", "Rostock", "Karlsruhe", "Freiburg", "Heidelberg", "Ingolstadt", "Mannheim", "Saarbrücken", "Magdeburg", "Wolfsburg", "Aschaffenburg", "Bremen", "Mainz", "Koblenz", "Bonn", "Dusseldorf", "Wurzburg", "Kassel", "Dortmund", "Gottingen", "Essen", "Solingen", "Halle", "Braunschweig", "Memmingen", "Lindau", "Chemnitz", "Gera", "Jena", "Weimar", "Erfurt", "Eisenach", "Wiesbaden", "Erlangen", "Lubbenau", "Krausnick", "Potsdam", "Oldenburg", "Warnemunde", "Bad Oeynhausen", "Osnabruck", "Bielefeld", "Marienberg", "Zschopau", "Wehretal-Oetmannshausen", "Hessisch Lichtenau", "Bochum", "Marktredwitz", "Bischofsgrun", "Bayreuth", "Bamberg", "Schweinfurt", "Flensburg", "Ludwigshafen", "Heilbronn", "Leverkusen", "Hollfeld", "Tubingen", "Kornwestheim", "Gotha", "Salzgitter", "Hildesheim", "Amberg", "Ansbach", "Aalen", "Bad Urach", "Bansin", "Barsinghausen", "Bastogne", "Bautzen", "Beelen", "Bergen auf Rügen", "Berchtesgaden", "Bergen", "Bensersiel", "Bernau am Chiemsee", "Bernburg", "Beverstedt", "Bestwig", "Biberach", "Binz", "Bischofswiesen", "Bischofgrun", "Bispingen", "Bitburg", "Blankenburg", "Bocholt", "Born", "Borken", "Duisburg", "Munster", "Offenburg", "Paderborn", "Passau", "Pforzheim", "Villach", "Hof"],
    
    // Austria (3)
    3: ["Wien", "Salzburg", "Innsbruck", "Linz", "Graz", "Bludenz", "Bregenz"],
    
    // Poland (4)
    4: ["Wroclaw", "Lodz", "Warszawa", "Bialystok", "Suwalki", "Ostrow Mazowiecka", "Augustow", "Krakow", "Czestochowa", "Gdynia", "Gdansk", "Przemysl", "Gorzow Wielkopolski", "Ostrow Wielkopolski", "Poznan", "Leszno", "Katowice", "Opole", "Klodzko", "Kielce", "Gliwice", "Bydgoszcz", "Torun", "Radom", "Lublin", "Tarnow", "Rzeszow", "Grudziad", "Zdunska Wola", "Kepno", "Jaroslaw", "Przeworsk", "Debica", "Nysa", "Kalisz", "Sieradz", "Swiebodzin", "Zielona Gora", "Žary", "Žagan", "Polkowice", "Swiebodzice", "Dzierzoniow", "Zabkowice Slaskie", "Lubin", "Jelenia Gora", "Bochnia", "Brzesko", "Pilzno", "Ropczyce", "Lancut", "Jedrzejow", "Skarzysko Kamienna", "Pulawy", "Lubliniec", "Radomsko", "Lowicz", "Lomza", "Grajewo", "Gniezno", "Limanowa", "Nowy Sacz", "Gorlice", "Sochaczew", "Jaslo", "Krosno", "Sanok", "Legnica", "Szczecin", "Bogatynia", "Zgorzelec", "Boleslawiec", "Gorzyczki", "Korczowa", "Krakovets", "Bielsko-Biala"],
    
    // Hungary (5)
    5: ["Györ", "Budapest", "Szeged"],
    
    // Slovakia (6) 
    6: ["Bratislava", "Hanušovce n. T.", "Štrba", "Makov", "Trenčín", "Dubnica nad Váhom", "Považská Bystrica", "Kraľovany", "Ružomberok", "Poprad", "Prešov", "Vranov nad Topľou", "Stražské", "Michalovce", "Humenné", "Snina", "Spišska Nová ves", "Levoča", "Košice", "Liptovský Mikuláš", "Žilina", "Rožňava", "Štítnik", "Jelšava", "Revúca", "Muráň", "Tisovec", "Brezno", "Banská Bystrica", "Zvolen", "Žiar n. Hronom", "Handlová", "Prievidza", "Bánovce n. B.", "Sabinov", "Lipany", "Ľubotin", "Stará Ľubovňa", "Podolinec", "Kežmarok", "Sečovce", "Rimavská Sobota", "Lučenec", "Nitra", "Trnava", "Sereď", "Zlaté Moravce", "Nová Baňa", "Žarnovica", "Nové Mesto n. V.", "Piešťany", "Topolčany", "Partizánské", "Hažín nad Cirochou", "Kamenica nad Cirochou", "Modrá nad Cirochou", "Dlhé nad Cirochou", "Belá nad Cirochou", "Vrútky", "Bardějov", "Svidnik", "Stropkov", "Giraltovce", "Martin", "Sobrance"],
    
    // United Kingdom (7)
    7: ["Dover", "London", "Bradford", "Leicester", "Sheffield", "Rotherham", "Peterborough", "Birmingham", "Derby", "Nottingham", "Manchester", "Chatham", "Luton", "Corby"],
    
    // Belgium (8)
    8: ["Liege", "Brussels", "Antwerp", "Ghent", "Bruges"],
    
    // Belarus (9)
    9: ["Grodno", "Lida", "Minsk", "Brest", "Baranovichy", "Orsha", "Vitebsk"],
    
    // Bulgaria (10)
    10: ["Sofia", "Varna", "Pazardzhik", "Plovdiv", "Stara Zagora", "Ruse", "Shumen", "Razgrad", "Burgas", "Sozopol", "Primorsko", "Kiten", "Ahtopol", "Sinemorec", "Carevo", "Nesebar", "Slanchev Briag", "Zlatni piasaci", "Balchik", "Sliven", "Dobrich", "Haskovo", "Chernomorec", "Lozenec", "Pomorie", "Ravda", "Sveti Vlas", "Obzor", "Albena", "Kavarna", "Shabla", "Veliko Tarnovo", "Aytos", "Karnobat", "Dimitrovgrad"],
    
    // Denmark (11)
    11: ["Rodby", "Nykobing", "Copenhagen", "Tapernoje", "Ringsted", "Slagelse", "Nyborg", "Odense", "Vejle", "Horsens", "Aarhus", "Aalborg"],
    
    // Estonia (12)
    12: ["Parnu", "Tallinn", "Valga", "Tartu", "Narva", "Kohtla Jarve"],
    
    // Finland (13)
    13: ["Turku", "Helsinki"],
    
    // France (14)
    14: ["Chambery", "Toulon", "Bordeaux", "Lille", "Perpignan", "Strasbourg", "Dijon", "Chalon-S-Saone", "Lyon", "Grenoble", "Valence", "Avignon", "Aix-en-Provence", "Marseille", "Nimes", "Montpellier", "Nancy", "Reims", "Paris", "Orleans", "Tours", "Angers", "Nantes", "Rouen", "Caen", "Rennes", "Metz", "Mulhouse", "Belfort", "Besancon", "Saint Etienne", "Clermond-Ferand", "Nice", "Annemasse", "Annecy", "Beziers", "Narbonne", "Carcassonne", "Toulouse", "Tarbes", "Pau", "Orthez", "Bayonne", "Le Cannet", "Puget Sur Argents", "Givors", "Ussel", "Tulle", "Brive", "Perigueux", "Poitiers", "Swindon", "Bristol", "Newport", "Saint Gaudens", "Le Havre", "Chessy", "Le Mans", "Saint-Brieuc", "Limoges", "Brive-La-Gaillarde", "Bapaume", "Beaune", "Beausoleil", "Beauval", "Bellegarde-sur-Valserine", "Bergerac", "Biarritz", "Blois", "Bollene", "Cannes"],
    
    // Netherlands (15)
    15: ["Lisse", "Eindhoven", "Arnhem", "Utrecht", "Amsterdam", "Den Haag", "Rotterdam", "Venlo", "Breda", "Enschede", "Nijmegen", "Bergen op Zoom", "Borger", "Maastricht"],
    
    // Croatia (16)
    16: ["Rijeka", "Opatija", "Rovinj", "Pula", "Crikvenica", "Malinska", "Krk", "Baška", "Karlovac", "Plitvička Jezera", "Zagreb", "Zadar", "Šibenik", "Primošten", "Trogir", "Split", "Omiš", "Makarska", "Tučepi", "Podgora", "Drvenik", "Gradac", "Ploče", "Dubrovnik", "Bibinje", "Sukosan", "Sveti Petar na Moru", "Sveti Filip i Jakov", "Biograd n. M.", "Pakostane", "Drage", "Pirovac", "Tribunj", "Vodice", "Brodarica", "Zaboric", "Bilo", "Dolac", "Rogoznica", "Podstrana", "Jesenice", "Dugi Rat", "Duce", "Stanici", "Ruskamen", "Mimice", "Pisak", "Brela", "Baska Voda", "Promajna", "Drasnice", "Igrane", "Zivogosce", "Zaostrog", "Podaca", "Brist", "Slano", "Barban", "Bedenica", "Benkovac", "Poreč"],
    
    // Italy (17)
    17: ["Genova", "Udine", "Mestre", "Venezia", "Padova", "Bologna", "Firenze", "Pisa", "Livorno", "Roma", "Napoli", "Bolzano", "Trento", "Verona", "Brescia", "Milano", "Lugano", "Como", "Torino", "Parma", "Rimini", "Pesaro", "Ancona", "Civitanova Marche", "Porto San Giorgio", "Porto DAscoli", "Giulianova", "Teramo", "Val Vomano", "LAquila", "Avezzano", "Sora", "Cassino", "Caserta", "Bardonecchia", "Bari", "Barletta", "Battipaglia", "Bellaria Igea Marina", "Belluno", "Benevento", "Bergamo", "Bisceglie", "Bitonto", "Borca di Cadore", "Pescara", "Perugia", "Ravenna", "Riccione", "San Benedetto del Tronto", "Trieste"],
    
    // Lithuania (18)
    18: ["Marijampole", "Kaunas", "Vilnius", "Panevezys", "Zarasai", "Utena", "Klaipeda", "Palanga", "Siauliai"],
    
    // Latvia (19)
    19: ["Riga", "Liepaja", "Jelgava", "Rezekne", "Valmiera", "Daugavpils", "Bauska"],
    
    // Luxembourg (20)
    20: ["Luxembourg"],
    
    // North Macedonia (21)
    21: ["Skopje", "Kumanovo"],
    
    // Moldova (22)
    22: ["Balti", "Kishinev", "Cimislia", "Comrat", "Ceadir-Lunga", "Orhei", "Singerei", "Riscani", "Leuseni", "Tiraspol", "Bender", "Hincesti", "Congaz"],
    
    // Norway (23)
    23: ["Sarpsborg", "Oslo", "Moss"],
    
    // Romania (24)
    24: ["Arad", "Timisoara", "Lugoj", "Deva", "Sebes", "Sibiu", "Fagaras", "Brasov", "Ploiesti", "Bucuresti", "Adjud", "Barlad", "Husi", "Salonta", "Zalau", "Carei", "Satu Mare", "Baia Mare", "Sighetul Marmatei", "Faget", "Resita", "Caransebes", "Baile Herculane", "Orsova", "Turnu Severin", "Lipova", "Hunedoara", "Petrosani", "Bumbesti Jiu", "Tg. Jiu", "Rovinari", "Filiasi", "Craiova", "Bals", "Slatina", "Orastie", "Alba Iulia", "Teius", "Aiud", "Turda", "Dej", "Bistrita", "Talmaciu", "Ramnicu Valcea", "Targoviste", "Medias", "Sighisoara", "Targu Mures", "Sfantul Gheorghe", "Targu Secuiesc", "Onesti", "Bacau", "Buhusi", "Piatra Neamt", "Targu Neamt", "Suceava", "Botosani", "Buzau", "Ramnicu Sarat", "Focsani", "Tecuci", "Vaslui", "Iasi", "Oltenita", "Calarasi", "Slobozia", "Braila", "Galati", "Fetesti", "Constanta", "Tulcea", "Pitesti", "Oradea", "Huedin", "Cluj Napoca", "Torda", "Marosludas", "Radnot", "Sovata", "Parajd", "Odorheiu Secuiesc", "Miercurea Ciuc", "Mizil", "Medgidia", "Cernavoda", "Urziceni", "Falticeni", "Pascani", "Roman", "Horezu", "Hateg", "Otelu Rosu", "Sinicolau Mare", "Toplita", "Reghin", "Herculane", "Sannicolau Mare", "Sinaia", "Giurgiu", "Vatra Dornei", "Gura Humorului", "Beclean", "Nadlac"],
    
    // Russia (25)
    25: ["Moskva", "St. Peterburg", "Ostrov", "Pskov", "Luga", "Kaliningrad", "Novgorod"],
    
    // Greece (26)
    26: ["Thessaloniki", "Athens", "Katerini", "Larissa", "Lamia", "Piraeus"],
    
    // Serbia (27)
    27: ["Novi Sad", "Beograd", "Subotica"],
    
    // Spain (28)
    28: ["Figueres", "Girona", "Lloret de Mar", "Barcelona", "Tarragona", "Salou", "Alcalá de Chivert", "Castellón", "Valencia", "Benidorm", "Alicante", "Murcia", "Lleida", "Zaragoza", "Madrid", "Irun", "San Sebastian", "Bilbao", "Burgos", "Valladolid", "Tordesillas", "Lorca", "Puerto Lumbreras", "Baza", "Guadix", "Granada", "Malaga", "Lerida", "Bailen", "Jaen", "Cordoba", "Lucena", "Bejar", "Plasencia", "Caceres", "Merida", "Zafra", "Sevilla", "Jerez", "Cadiz", "Vejer", "Tarifa", "Algeciras", "Benavente", "Blanes"],
    
    // Sweden (29)
    29: ["Malmö", "Lund", "Jonköping", "Linköping", "Stockholm", "Uppsala", "Helsingborg", "Halmstad", "Varberg", "Goteborg", "Uddevalla", "Norrkoping", "Nykoping", "Sodertalje", "Ljungby", "Vasteras", "Orebro", "Varnamo", "Landskrona", "Vaxjo", "Boras"],
    
    // Switzerland (30)
    30: ["St. Gallen", "Zurich", "Bern", "Lausanne", "Geneve", "Luzern", "Basel", "Fribourg", "Bulle", "Bellinzona", "Winterthur"],
    
    // Turkey (31)
    31: ["Istanbul"],
    
    // Ukraine (32)
    32: ["Lvov", "Ternopil", "Chmelnickij", "Vinnica", "Uman", "Kropyvnitskyi", "Dnipro", "Zaporozje", "Doneck", "Boryspil", "Pyriatyn", "Lubny", "Poltava", "Kharkiv", "Zolochiv", "Terebovlya", "Chortkiv", "Kamianets Podilskiy", "Stryj", "Dolina", "Kaluš", "Ivano Frankivsk", "Nadvirna", "Deljatin", "Rachiv", "Odesa", "Nikolaev", "Cherson", "Rivne", "Zitomir", "Kiev", "Čerkasy", "Luck", "Kovel", "Užhorod", "Mukačevo", "Iršava", "Chust", "Tjačiv", "Vinohradovo", "Bolechiv", "Černovcy", "Kolomyja", "Sniatyn", "Mizhgirya", "Rohatin", "Kryvyj Rih", "Gorodenka", "Brody", "Sarny", "Korosten", "Oleksandriia", "Pyatikhatky", "Krasnohrad", "Beregovo", "Vylok", "Bushtyno", "Drahovo", "Yaremche", "Yasinya", "Dubno", "Bohorodcany", "Lanchyn", "Velykyi Bychkiv", "Svaljava", "Nizhni Vorota", "Pervomaisk", "Truskavets", "Drohobych", "Zalishchyky", "Dubove", "Nova Kachovka", "Berdansk", "Mariupol", "Melitopol", "Kosiv", "Tovste", "Sambir", "Kremenchuk", "Novovolinsk", "Vladimir Volynskiy", "Kamianske", "Tlumach", "Letychiv", "Nemyriv", "Haisyn", "Koblevo", "Pryluky", "Romny", "Nedryhailiv", "Sumy", "Yuzhnoukrainsk", "Voznesensk", "Chop", "Novohrad-Volynskyi", "Stebnyk", "Busk", "Chmilnik", "Volochisk", "Kryve Ozero", "Pereiaslav", "Zolotonosha", "Smila", "Chernihiv", "Zhashkiv", "Golovanivsk", "Talne", "Zvenigorodka", "Shpola", "Nova Odesa", "Synevyr", "Aleksandrivka", "Khorol", "Shepetivka", "Bila Tserkva", "Skvyra", "Popilnya", "Silce", "Hotyn", "Kagarlik", "Korsun Shevchenkivsky", "Horodyshche", "Volovets", "Solotvyno", "Izmajil", "Sarata", "Tatarbunary", "Buchach", "Oleksandriia", "Nyzhni Vorota", "Teresva", "Skole", "Slavjansk", "Pokrovsk", "Kramatorsk", "Zvyahel", "Vyžnycja", "Storozhynets", "Chutove", "Zabolotiv", "Lokhvytsia", "Zboriv", "Valky", "Burshtyn"],
    
    // Slovenia (33)
    33: ["Maribor", "Bled", "Ljubljana"],
    
    // Bosnia and Herzegovina (34)
    34: ["Sarajevo"]
  }
  
  // Helper function to insert cities for a country
  async function insertCountryCities(countryId, cityNames) {
    if (!cityNames || cityNames.length === 0) return
    
    const cities = cityNames.map(cityName => ({
      id: cityId++,
      countryId,
      names: {
        en: cityName,
        cs: cityName,
        bg: cityName,
        ru: cityName,
        uk: cityName
      },
      variations: [],
      isActive: true,
      latitude: null,
      longitude: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    
    await db.collection('cities').insertMany(cities)
    const countryInfo = await db.collection('countries').findOne({ id: countryId })
    console.log(`✅ Inserted ${cities.length} cities for ${countryInfo?.names?.en || 'Unknown'}`)
  }
  
  // Insert cities for each country
  for (const [countryId, cities] of Object.entries(cityMappings)) {
    await insertCountryCities(parseInt(countryId), cities)
  }
  
  console.log(`Total cities inserted: ${cityId - 1}`)
}

async function insertCarriers(db) {
  const carriers = [
    { id: 1, code: "FB", name: "FlixBus", isExternal: true, logoUrl: "https://www.flixbus.com/assets/images/logo.svg", website: "https://www.flixbus.com", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, code: "BLA", name: "BlaBlaCar Bus", isExternal: true, logoUrl: "https://www.blablacar.com/images/logo.svg", website: "https://www.blablacar.com", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, code: "ECO", name: "Ecolines", isExternal: true, logoUrl: null, website: "https://www.ecolines.net", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, code: "SA", name: "Student Agency", isExternal: true, logoUrl: null, website: "https://www.studentagency.eu", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, code: "EE", name: "East Express", isExternal: true, logoUrl: null, website: "http://www.east-express.cz", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 6, code: "ET", name: "EuroTours", isExternal: false, logoUrl: null, website: null, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]

  await db.collection('carriers').insertMany(carriers)
  console.log(`✅ Inserted ${carriers.length} carriers`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('init-complete-db.js')) {
  initializeCompleteDatabase()
    .then(() => {
      console.log('🎉 Complete database initialization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Complete database initialization failed:', error)
      process.exit(1)
    })
}

export { initializeCompleteDatabase } 