import clientPromise from './lib/db.js';

async function debugDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('eurotours');
    
    console.log('🔍 Debugging database contents...');
    
    // Check total routes
    const routeCount = await db.collection('routes').countDocuments();
    console.log(`📊 Total routes in database: ${routeCount}`);
    
    // Check latest routes
    const latestRoutes = await db.collection('routes').find().sort({createdAt: -1}).limit(5).toArray();
    console.log(`📋 Latest routes:`, latestRoutes.map(r => ({ 
      id: r.id, 
      searchId: r.searchId, 
      direction: r.direction, 
      price: r.price,
      createdAt: r.createdAt 
    })));
    
    // Check searches
    const searchCount = await db.collection('searches').countDocuments();
    console.log(`🔍 Total searches in database: ${searchCount}`);
    
    const latestSearches = await db.collection('searches').find().sort({createdAt: -1}).limit(3).toArray();
    console.log(`📋 Latest searches:`, latestSearches.map(s => ({ 
      id: s.id, 
      fromCityId: s.fromCityId, 
      toCityId: s.toCityId,
      createdAt: s.createdAt 
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database debug error:', error);
    process.exit(1);
  }
}

debugDatabase(); 