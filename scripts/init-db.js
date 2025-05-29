import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eurotours'

async function initializeDatabase() {
  console.log('🚀 Initializing EuroTours database...')
  
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
    
    // Insert sample countries
    console.log('🌍 Inserting countries...')
    await insertCountries(db)
    
    // Insert sample cities
    console.log('🏙️ Inserting cities...')
    await insertCities(db)
    
    // Insert carriers
    console.log('🚌 Inserting carriers...')
    await insertCarriers(db)
    
    console.log('✅ Database initialization completed!')
    
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

async function insertCountries(db) {
  const countries = [
    {
      id: 1,
      code: "CZ",
      names: {
        en: "Czech Republic",
        cs: "Česká republika",
        bg: "Чешка република",
        ru: "Чешская Республика",
        uk: "Чеська Республіка"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      code: "DE",
      names: {
        en: "Germany",
        cs: "Německo",
        bg: "Германия",
        ru: "Германия",
        uk: "Німеччина"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      code: "AT",
      names: {
        en: "Austria",
        cs: "Rakousko",
        bg: "Австрия",
        ru: "Австрия",
        uk: "Австрія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      code: "PL",
      names: {
        en: "Poland",
        cs: "Polsko",
        bg: "Полша",
        ru: "Польша",
        uk: "Польща"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      code: "HU",
      names: {
        en: "Hungary",
        cs: "Maďarsko",
        bg: "Унгария",
        ru: "Венгрия",
        uk: "Угорщина"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 6,
      code: "SK",
      names: {
        en: "Slovakia",
        cs: "Slovensko",
        bg: "Словакия",
        ru: "Словакия",
        uk: "Словаччина"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Additional countries
    {
      id: 7,
      code: "GB",
      names: {
        en: "United Kingdom",
        cs: "Velká Británie",
        bg: "Великобритания",
        ru: "Великобритания",
        uk: "Великобританія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 8,
      code: "BE",
      names: {
        en: "Belgium",
        cs: "Belgie",
        bg: "Белгия",
        ru: "Бельгия",
        uk: "Бельгія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 9,
      code: "BY",
      names: {
        en: "Belarus",
        cs: "Bělorusko",
        bg: "Беларус",
        ru: "Беларусь",
        uk: "Білорусь"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 10,
      code: "BG",
      names: {
        en: "Bulgaria",
        cs: "Bulharsko",
        bg: "България",
        ru: "Болгария",
        uk: "Болгарія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 11,
      code: "DK",
      names: {
        en: "Denmark",
        cs: "Dánsko",
        bg: "Дания",
        ru: "Дания",
        uk: "Данія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 12,
      code: "EE",
      names: {
        en: "Estonia",
        cs: "Estonsko",
        bg: "Естония",
        ru: "Эстония",
        uk: "Естонія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 13,
      code: "FI",
      names: {
        en: "Finland",
        cs: "Finsko",
        bg: "Финландия",
        ru: "Финляндия",
        uk: "Фінляндія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 14,
      code: "FR",
      names: {
        en: "France",
        cs: "Francie",
        bg: "Франция",
        ru: "Франция",
        uk: "Франція"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 15,
      code: "NL",
      names: {
        en: "Netherlands",
        cs: "Nizozemsko",
        bg: "Нидерландия",
        ru: "Нидерланды",
        uk: "Нідерланди"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 16,
      code: "HR",
      names: {
        en: "Croatia",
        cs: "Chorvatsko",
        bg: "Хърватия",
        ru: "Хорватия",
        uk: "Хорватія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 17,
      code: "IT",
      names: {
        en: "Italy",
        cs: "Itálie",
        bg: "Италия",
        ru: "Италия",
        uk: "Італія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 18,
      code: "LT",
      names: {
        en: "Lithuania",
        cs: "Litva",
        bg: "Литва",
        ru: "Литва",
        uk: "Литва"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 19,
      code: "LV",
      names: {
        en: "Latvia",
        cs: "Lotyšsko",
        bg: "Латвия",
        ru: "Латвия",
        uk: "Латвія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 20,
      code: "LU",
      names: {
        en: "Luxembourg",
        cs: "Lucembursko",
        bg: "Люксембург",
        ru: "Люксембург",
        uk: "Люксембург"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 21,
      code: "MK",
      names: {
        en: "North Macedonia",
        cs: "Severní Makedonie",
        bg: "Северна Македония",
        ru: "Северная Македония",
        uk: "Північна Македонія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 22,
      code: "MD",
      names: {
        en: "Moldova",
        cs: "Moldavsko",
        bg: "Молдова",
        ru: "Молдова",
        uk: "Молдова"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 23,
      code: "NO",
      names: {
        en: "Norway",
        cs: "Norsko",
        bg: "Норвегия",
        ru: "Норвегия",
        uk: "Норвегія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 24,
      code: "RO",
      names: {
        en: "Romania",
        cs: "Rumunsko",
        bg: "Румъния",
        ru: "Румыния",
        uk: "Румунія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 25,
      code: "RU",
      names: {
        en: "Russia",
        cs: "Rusko",
        bg: "Русия",
        ru: "Россия",
        uk: "Росія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 26,
      code: "GR",
      names: {
        en: "Greece",
        cs: "Řecko",
        bg: "Гърция",
        ru: "Греция",
        uk: "Греція"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 27,
      code: "RS",
      names: {
        en: "Serbia",
        cs: "Srbsko",
        bg: "Сърбия",
        ru: "Сербия",
        uk: "Сербія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 28,
      code: "ES",
      names: {
        en: "Spain",
        cs: "Španělsko",
        bg: "Испания",
        ru: "Испания",
        uk: "Іспанія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 29,
      code: "SE",
      names: {
        en: "Sweden",
        cs: "Švédsko",
        bg: "Швеция",
        ru: "Швеция",
        uk: "Швеція"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 30,
      code: "CH",
      names: {
        en: "Switzerland",
        cs: "Švýcarsko",
        bg: "Швейцария",
        ru: "Швейцария",
        uk: "Швейцарія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 31,
      code: "TR",
      names: {
        en: "Turkey",
        cs: "Turecko",
        bg: "Турция",
        ru: "Турция",
        uk: "Туреччина"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 32,
      code: "UA",
      names: {
        en: "Ukraine",
        cs: "Ukrajina",
        bg: "Украйна",
        ru: "Украина",
        uk: "Україна"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 33,
      code: "SI",
      names: {
        en: "Slovenia",
        cs: "Slovinsko",
        bg: "Словения",
        ru: "Словения",
        uk: "Словенія"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 34,
      code: "BA",
      names: {
        en: "Bosnia and Herzegovina",
        cs: "Bosna a Hercegovina",
        bg: "Босна и Херцеговина",
        ru: "Босния и Герцеговина",
        uk: "Боснія і Герцеговина"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  await db.collection('countries').insertMany(countries)
  console.log(`✅ Inserted ${countries.length} countries`)
}

async function insertCities(db) {
  const cities = [
    // Czech Republic
    {
      id: 1,
      countryId: 1,
      names: {
        en: "Prague",
        cs: "Praha",
        bg: "Прага",
        ru: "Прага",
        uk: "Прага"
      },
      variations: ["Prag", "Praga"],
      isActive: true,
      latitude: 50.0755,
      longitude: 14.4378,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      countryId: 1,
      names: {
        en: "Brno",
        cs: "Brno",
        bg: "Брно",
        ru: "Брно",
        uk: "Брно"
      },
      variations: [],
      isActive: true,
      latitude: 49.1951,
      longitude: 16.6068,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Germany
    {
      id: 3,
      countryId: 2,
      names: {
        en: "Berlin",
        cs: "Berlín",
        bg: "Берлин",
        ru: "Берлин",
        uk: "Берлін"
      },
      variations: [],
      isActive: true,
      latitude: 52.5200,
      longitude: 13.4050,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      countryId: 2,
      names: {
        en: "Munich",
        cs: "Mnichov",
        bg: "Мюнхен",
        ru: "Мюнхен",
        uk: "Мюнхен"
      },
      variations: ["München"],
      isActive: true,
      latitude: 48.1351,
      longitude: 11.5820,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Austria
    {
      id: 5,
      countryId: 3,
      names: {
        en: "Vienna",
        cs: "Vídeň",
        bg: "Виена",
        ru: "Вена",
        uk: "Відень"
      },
      variations: ["Wien"],
      isActive: true,
      latitude: 48.2082,
      longitude: 16.3738,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Poland
    {
      id: 6,
      countryId: 4,
      names: {
        en: "Warsaw",
        cs: "Varšava",
        bg: "Варшава",
        ru: "Варшава",
        uk: "Варшава"
      },
      variations: ["Warszawa"],
      isActive: true,
      latitude: 52.2297,
      longitude: 21.0122,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 7,
      countryId: 4,
      names: {
        en: "Krakow",
        cs: "Krakov",
        bg: "Краков",
        ru: "Краков",
        uk: "Краків"
      },
      variations: ["Kraków", "Cracow"],
      isActive: true,
      latitude: 50.0647,
      longitude: 19.9450,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Hungary
    {
      id: 8,
      countryId: 5,
      names: {
        en: "Budapest",
        cs: "Budapešť",
        bg: "Будапеща",
        ru: "Будапешт",
        uk: "Будапешт"
      },
      variations: [],
      isActive: true,
      latitude: 47.4979,
      longitude: 19.0402,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Slovakia
    {
      id: 9,
      countryId: 6,
      names: {
        en: "Bratislava",
        cs: "Bratislava",
        bg: "Братислава",
        ru: "Братислава",
        uk: "Братислава"
      },
      variations: [],
      isActive: true,
      latitude: 48.1486,
      longitude: 17.1077,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  await db.collection('cities').insertMany(cities)
  console.log(`✅ Inserted ${cities.length} cities`)
}

async function insertCarriers(db) {
  const carriers = [
    {
      id: 1,
      code: "FB",
      name: "FlixBus",
      isExternal: true,
      logoUrl: "https://www.flixbus.com/assets/images/logo.svg",
      website: "https://www.flixbus.com",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      code: "BLA",
      name: "BlaBlaCar Bus",
      isExternal: true,
      logoUrl: "https://www.blablacar.com/images/logo.svg",
      website: "https://www.blablacar.com",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      code: "ECO",
      name: "Ecolines",
      isExternal: true,
      logoUrl: null,
      website: "https://www.ecolines.net",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      code: "SA",
      name: "Student Agency",
      isExternal: true,
      logoUrl: null,
      website: "https://www.studentagency.eu",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      code: "EE",
      name: "East Express",
      isExternal: true,
      logoUrl: null,
      website: "http://www.east-express.cz",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 6,
      code: "ET",
      name: "EuroTours",
      isExternal: false,
      logoUrl: null,
      website: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  await db.collection('carriers').insertMany(carriers)
  console.log(`✅ Inserted ${carriers.length} carriers`)
}

// Run the initialization if this script is called directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error)
      process.exit(1)
    })
}

export { initializeDatabase } 