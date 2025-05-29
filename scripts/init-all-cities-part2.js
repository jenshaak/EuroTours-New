import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eurotours'

export async function insertRemainingCities(db, startingCityId = 200) {
  let cityId = startingCityId
  
  // Netherlands (NL - id: 15)
  const netherlandsCities = [
    "Lisse", "Eindhoven", "Arnhem", "Utrecht", "Amsterdam", "Den Haag", 
    "Rotterdam", "Venlo", "Breda", "Enschede", "Nijmegen", "Bergen op Zoom", 
    "Borger", "Maastricht"
  ]
  
  // Croatia (HR - id: 16)
  const croatiaCities = [
    "Rijeka", "Opatija", "Rovinj", "Pula", "Crikvenica", "Malinska", "Krk", 
    "Baška", "Karlovac", "Plitvička Jezera", "Zagreb", "Zadar", "Šibenik", 
    "Primošten", "Trogir", "Split", "Omiš", "Makarska", "Tučepi", "Podgora", 
    "Drvenik", "Gradac", "Ploče", "Dubrovnik", "Bibinje", "Sukosan", 
    "Sveti Petar na Moru", "Sveti Filip i Jakov", "Biograd n. M.", "Pakostane", 
    "Drage", "Pirovac", "Tribunj", "Vodice", "Brodarica", "Zaboric", "Bilo", 
    "Dolac", "Rogoznica", "Podstrana", "Jesenice", "Dugi Rat", "Duce", 
    "Stanici", "Ruskamen", "Mimice", "Pisak", "Brela", "Baska Voda", 
    "Promajna", "Drasnice", "Igrane", "Zivogosce", "Zaostrog", "Podaca", 
    "Brist", "Slano", "Barban", "Bedenica", "Benkovac", "Poreč"
  ]
  
  // Italy (IT - id: 17)
  const italyCities = [
    "Genova", "Udine", "Mestre", "Venezia", "Padova", "Bologna", "Firenze", 
    "Pisa", "Livorno", "Roma", "Napoli", "Bolzano", "Trento", "Verona", 
    "Brescia", "Milano", "Lugano", "Como", "Torino", "Parma", "Rimini", 
    "Pesaro", "Ancona", "Civitanova Marche", "Porto San Giorgio", 
    "Porto DAscoli", "Giulianova", "Teramo", "Val Vomano", "LAquila", 
    "Avezzano", "Sora", "Cassino", "Caserta", "Bardonecchia", "Bari", 
    "Barletta", "Battipaglia", "Bellaria Igea Marina", "Belluno", 
    "Benevento", "Bergamo", "Bisceglie", "Bitonto", "Borca di Cadore", 
    "Pescara", "Perugia", "Ravenna", "Riccione", "San Benedetto del Tronto", 
    "Trieste"
  ]
  
  // Lithuania (LT - id: 18)
  const lithuaniaCities = [
    "Marijampole", "Kaunas", "Vilnius", "Panevezys", "Zarasai", "Utena", 
    "Klaipeda", "Palanga", "Siauliai"
  ]
  
  // Latvia (LV - id: 19)
  const latviaCities = [
    "Riga", "Liepaja", "Jelgava", "Rezekne", "Valmiera", "Daugavpils", "Bauska"
  ]
  
  // Luxembourg (LU - id: 20)
  const luxembourgCities = ["Luxembourg"]
  
  // North Macedonia (MK - id: 21)
  const macedoniaCities = ["Skopje", "Kumanovo"]
  
  // Moldova (MD - id: 22)
  const moldovaCities = [
    "Balti", "Kishinev", "Cimislia", "Comrat", "Ceadir-Lunga", "Orhei", 
    "Singerei", "Riscani", "Leuseni", "Tiraspol", "Bender", "Hincesti", "Congaz"
  ]
  
  // Germany (DE - id: 2) - Extended list
  const extendedGermanyCities = [
    "Regensburg", "Munich", "Augsburg", "Gunzburg", "Ulm", "Stuttgart", 
    "Dresden", "Berlin", "Nurnberg", "Frankfurt", "Koln", "Aachen", 
    "Hamburg", "Hannover", "Leipzig", "Rostock", "Karlsruhe", "Freiburg", 
    "Heidelberg", "Ingolstadt", "Mannheim", "Saarbrücken", "Magdeburg", 
    "Wolfsburg", "Aschaffenburg", "Bremen", "Mainz", "Koblenz", "Bonn", 
    "Dusseldorf", "Wurzburg", "Kassel", "Dortmund", "Gottingen", "Essen", 
    "Solingen", "Halle", "Braunschweig", "Memmingen", "Lindau", "Chemnitz", 
    "Gera", "Jena", "Weimar", "Erfurt", "Eisenach", "Wiebaden", "Erlangen", 
    "Lubbenau", "Krausnick", "Potsdam", "Oldenburg", "Warnemunde", 
    "Bad Oeynhausen", "Osnabruck", "Bielefeld", "Marienberg", "Zschopau", 
    "Wehretal-Oetmannshausen", "Hessisch Lichtenau", "Bochum", "Marktredwitz", 
    "Bischofsgrun", "Bayreuth", "Bamberg", "Schweinfurt", "Flensburg", 
    "Ludwigshafen", "Heilbronn", "Leverkusen", "Hollfeld", "Tubingen", 
    "Kornwestheim", "Gotha", "Salzgitter", "Hildesheim", "Amberg", "Ansbach", 
    "Aalen", "Bad Urach", "Bansin", "Barsinghausen", "Bastogne", "Bautzen", 
    "Beelen", "Bergen auf Rügen", "Berchtesgaden", "Bergen", "Bensersiel", 
    "Bernau am Chiemsee", "Bernburg", "Beverstedt", "Bestwig", "Biberach", 
    "Binz", "Bischofswiesen", "Bischofgrun", "Bispingen", "Bitburg", 
    "Blankenburg", "Bocholt", "Born", "Borken", "Duisburg", "Munster", 
    "Offenburg", "Paderborn", "Passau", "Pforzheim", "Villach", "Hof"
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
  
  // Insert remaining cities
  await insertCountryCities(15, netherlandsCities, 'NL')
  await insertCountryCities(16, croatiaCities, 'HR')
  await insertCountryCities(17, italyCities, 'IT')
  await insertCountryCities(18, lithuaniaCities, 'LT')
  await insertCountryCities(19, latviaCities, 'LV')
  await insertCountryCities(20, luxembourgCities, 'LU')
  await insertCountryCities(21, macedoniaCities, 'MK')
  await insertCountryCities(22, moldovaCities, 'MD')
  await insertCountryCities(2, extendedGermanyCities, 'DE-Extended')
  
  return cityId
} 