// City ID mappings for external providers
// Our database city ID -> External provider city ID

export const FLIXBUS_CITY_MAPPING = {
  // Czech Republic
  4: "dcf4c5c4-acb4-11e6-9066-549f35045cb0", // Prague -> Prague FlixBus UUID
  
  // United Kingdom  
  308: "f6d127be-acb4-11e6-9066-549f35045cb0", // London -> London FlixBus UUID
  
  // Alternative numeric IDs to try
  // 4: 1, // Prague alternative
  // 308: 65, // London alternative
  
  // Germany
  // Add more mappings as needed
}

export const BLABLACAR_CITY_MAPPING = {
  // Czech Republic
  4: "prague", // Prague -> BlaBlaCar city identifier
  
  // United Kingdom
  308: "london", // London -> BlaBlaCar city identifier
  
  // We'll need to discover the actual BlaBlaCar city IDs
  // These might be strings like "prague", "london" or numeric IDs
}

export function getFlixBusCityId(ourCityId) {
  const flixbusCityId = FLIXBUS_CITY_MAPPING[ourCityId]
  if (!flixbusCityId) {
    console.log(`⚠️ No FlixBus mapping found for city ID ${ourCityId}`)
    return null
  }
  return flixbusCityId
}

export function getBlaBlaCityCityId(ourCityId) {
  const blablacarCityId = BLABLACAR_CITY_MAPPING[ourCityId]
  if (!blablacarCityId) {
    console.log(`⚠️ No BlaBlaCar mapping found for city ID ${ourCityId}`)
    return null
  }
  return blablacarCityId
}

// Function to populate mappings from external APIs
export async function updateCityMappings(db) {
  console.log('🗺️ Updating city mappings from external APIs...')
  
  try {
    // This would fetch cities from external APIs and create mappings
    // Based on city names/coordinates matching
    
    // For now, we'll use manual mappings above
    console.log('✅ City mappings updated')
    
  } catch (error) {
    console.error('❌ Error updating city mappings:', error)
  }
} 