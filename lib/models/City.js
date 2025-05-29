import { z } from 'zod';

export const CitySchema = z.object({
  id: z.number(),
  countryId: z.number(),
  names: z.object({
    en: z.string().optional(),
    cs: z.string().optional(),
    bg: z.string().optional(),
    ru: z.string().optional(),
    uk: z.string().optional(),
  }),
  variations: z.array(z.string()).default([]), // Alternative names for search
  isActive: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export class City {
  constructor(data) {
    this.data = CitySchema.parse(data);
  }

  static validate(data) {
    return CitySchema.parse(data);
  }

  static async findAll(db) {
    const collection = db.collection('cities');
    return await collection.find({ isActive: true }).toArray();
  }

  static async findByCountry(db, countryId) {
    const collection = db.collection('cities');
    return await collection.find({ countryId, isActive: true }).toArray();
  }

  static async search(db, query, limit = 10) {
    const collection = db.collection('cities');
    return await collection.find({
      isActive: true,
      $or: [
        { 'names.en': { $regex: query, $options: 'i' } },
        { 'names.cs': { $regex: query, $options: 'i' } },
        { 'names.bg': { $regex: query, $options: 'i' } },
        { 'names.ru': { $regex: query, $options: 'i' } },
        { 'names.uk': { $regex: query, $options: 'i' } },
        { 'variations': { $regex: query, $options: 'i' } }
      ]
    }).limit(limit).toArray();
  }

  static async findById(db, id) {
    const collection = db.collection('cities');
    return await collection.findOne({ id, isActive: true });
  }

  static async create(db, data) {
    const collection = db.collection('cities');
    const validatedData = City.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async update(db, id, data) {
    const collection = db.collection('cities');
    const updateData = { ...data, updatedAt: new Date() };
    return await collection.updateOne({ id }, { $set: updateData });
  }

  // Get cities formatted for select components
  static async getForSelect(db) {
    const collection = db.collection('cities');
    return await collection.find(
      { isActive: true },
      { 
        projection: { 
          id: 1, 
          names: 1, 
          variations: 1,
          countryId: 1
        }
      }
    ).toArray();
  }
} 