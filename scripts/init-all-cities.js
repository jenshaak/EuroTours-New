import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eurotours'

async function initializeAllCities() {
  console.log('🚀 Initializing all European cities...')
  
  const client = new MongoClient(DATABASE_URL)
  
  try {
    await client.connect()
    const db = client.db('eurotours')
    
    // Clear existing cities
    console.log('🧹 Clearing existing cities...')
    await db.collection('cities').deleteMany({})
    
    // Insert all cities by country
    await insertCitiesByCountry(db)
    
    console.log('✅ All cities initialization completed!')
    
  } catch (error) {
    console.error('❌ Error initializing cities:', error)
    throw error
  } finally {
    await client.close()
  }
}

async function insertCitiesByCountry(db) {
  let cityId = 1
  
  // England (GB - id: 7)
  const englandCities = [
    "Dover", "London", "Bradford", "Leicester", "Sheffield", "Rotherham", 
    "Peterborough", "Birmingham", "Derby", "Nottingham", "Manchester", 
    "Chatham", "Luton", "Corby"
  ]
  
  // Belgium (BE - id: 8)
  const belgiumCities = [
    "Liege", "Brussels", "Antwerp", "Ghent", "Bruges"
  ]
  
  // Belarus (BY - id: 9)
  const belarusCities = [
    "Grodno", "Lida", "Minsk", "Brest", "Baranovichy", "Orsha", "Vitebsk"
  ]
  
  // Bulgaria (BG - id: 10)
  const bulgariaCities = [
    "Sofia", "Varna", "Pazardzhik", "Plovdiv", "Stara Zagora", "Ruse", 
    "Shumen", "Razgrad", "Burgas", "Sozopol", "Primorsko", "Kiten", 
    "Ahtopol", "Sinemorec", "Carevo", "Nesebar", "Slanchev Briag", 
    "Zlatni piasaci", "Balchik", "Sliven", "Dobrich", "Haskovo", 
    "Chernomorec", "Lozenec", "Pomorie", "Ravda", "Sveti Vlas", 
    "Obzor", "Albena", "Kavarna", "Shabla", "Veliko Tarnovo", 
    "Aytos", "Karnobat", "Dimitrovgrad"
  ]
  
  // Denmark (DK - id: 11)
  const denmarkCities = [
    "Rodby", "Nykobing", "Copenhagen", "Tapernoje", "Ringsted", 
    "Slagelse", "Nyborg", "Odense", "Vejle", "Horsens", "Aarhus", "Aalborg"
  ]
  
  // Estonia (EE - id: 12)
  const estoniaCities = [
    "Parnu", "Tallinn", "Valga", "Tartu", "Narva", "Kohtla Jarve"
  ]
  
  // Finland (FI - id: 13)
  const finlandCities = [
    "Turku", "Helsinki"
  ]
  
  // France (FR - id: 14)
  const franceCities = [
    "Chambery", "Toulon", "Bordeaux", "Lille", "Perpignan", "Strasbourg", 
    "Dijon", "Chalon-S-Saone", "Lyon", "Grenoble", "Valence", "Avignon", 
    "Aix-en-Provence", "Marseille", "Nimes", "Montpellier", "Nancy", 
    "Reims", "Paris", "Orleans", "Tours", "Angers", "Nantes", "Rouen", 
    "Caen", "Rennes", "Metz", "Mulhouse", "Belfort", "Besancon", 
    "Saint Etienne", "Clermond-Ferand", "Nice", "Annemasse", "Annecy", 
    "Beziers", "Narbonne", "Carcassonne", "Toulouse", "Tarbes", "Pau", 
    "Orthez", "Bayonne", "Le Cannet", "Puget Sur Argents", "Givors", 
    "Ussel", "Tulle", "Brive", "Perigueux", "Poitiers", "Swindon", 
    "Bristol", "Newport", "Saint Gaudens", "Le Havre", "Chessy", 
    "Le Mans", "Saint-Brieuc", "Limoges", "Brive-La-Gaillarde", 
    "Bapaume", "Beaune", "Beausoleil", "Beauval", "Bellegarde-sur-Valserine", 
    "Bergerac", "Biarritz", "Blois", "Bollene", "Cannes"
  ]
  
  // Helper function to insert cities for a country
  async function insertCountryCities(countryId, cityNames, countryCode) {
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
    
    if (cities.length > 0) {
      await db.collection('cities').insertMany(cities)
      console.log(`✅ Inserted ${cities.length} cities for ${countryCode}`)
    }
  }
  
  // Insert cities by country
  await insertCountryCities(7, englandCities, 'GB')
  await insertCountryCities(8, belgiumCities, 'BE')
  await insertCountryCities(9, belarusCities, 'BY')
  await insertCountryCities(10, bulgariaCities, 'BG')
  await insertCountryCities(11, denmarkCities, 'DK')
  await insertCountryCities(12, estoniaCities, 'EE')
  await insertCountryCities(13, finlandCities, 'FI')
  await insertCountryCities(14, franceCities, 'FR')
  
  console.log(`Total cities inserted: ${cityId - 1}`)
}

// Run if called directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  initializeAllCities()
    .then(() => {
      console.log('🎉 All cities initialization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Cities initialization failed:', error)
      process.exit(1)
    })
}

export { initializeAllCities } 