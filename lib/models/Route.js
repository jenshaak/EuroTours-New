import { z } from 'zod';

export const RouteSchema = z.object({
  id: z.string(),
  searchId: z.string(),
  carrierId: z.number(),
  fromCityId: z.number(),
  toCityId: z.number(),
  departureTime: z.date(),
  arrivalTime: z.date(),
  direction: z.enum(['there', 'back']),
  price: z.number(),
  maxPrice: z.number().optional(),
  currency: z.string(),
  isExternal: z.boolean().default(false),
  externalId: z.string().optional(),
  isDirect: z.boolean().default(true),
  availableSeats: z.number().optional(),
  showedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
});

export class Route {
  constructor(data) {
    this.data = RouteSchema.parse(data);
  }

  static validate(data) {
    return RouteSchema.parse(data);
  }

  static async findBySearch(db, searchId) {
    const collection = db.collection('routes');
    return await collection.find({ searchId }).sort({ departureTime: 1 }).toArray();
  }

  static async findNewExternalRoutes(db, searchId) {
    const collection = db.collection('routes');
    return await collection.find({
      searchId,
      isExternal: true,
      showedAt: null
    }).sort({ departureTime: 1 }).toArray();
  }

  static async markAsShown(db, routeIds) {
    const collection = db.collection('routes');
    return await collection.updateMany(
      { id: { $in: routeIds } },
      { $set: { showedAt: new Date() } }
    );
  }

  static async create(db, data) {
    const collection = db.collection('routes');
    const validatedData = Route.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async createMany(db, routes) {
    const collection = db.collection('routes');
    const validatedRoutes = routes.map(route => Route.validate(route));
    const result = await collection.insertMany(validatedRoutes);
    return result;
  }

  static async deleteBySearch(db, searchId) {
    const collection = db.collection('routes');
    return await collection.deleteMany({ searchId });
  }

  static async findInternalRoutes(db, fromCityId, toCityId, departureDate) {
    const collection = db.collection('routes');
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);

    return await collection.find({
      fromCityId,
      toCityId,
      isExternal: false,
      departureTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ departureTime: 1 }).toArray();
  }

  // Calculate trip duration in minutes
  static getDuration(route) {
    return Math.round((route.arrivalTime - route.departureTime) / (1000 * 60));
  }

  // Format duration to human readable format
  static formatDuration(route) {
    const minutes = Route.getDuration(route);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }
} 