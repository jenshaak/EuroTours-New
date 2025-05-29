import { z } from 'zod';

export const CountrySchema = z.object({
  id: z.number(),
  code: z.string().min(2).max(3), // "CZ", "GB", "DE"
  names: z.object({
    en: z.string().optional(),
    cs: z.string().optional(),
    bg: z.string().optional(),
    ru: z.string().optional(),
    uk: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export class Country {
  constructor(data) {
    this.data = CountrySchema.parse(data);
  }

  static validate(data) {
    return CountrySchema.parse(data);
  }

  static async findAll(db) {
    const collection = db.collection('countries');
    return await collection.find({ isActive: true }).toArray();
  }

  static async findByCode(db, code) {
    const collection = db.collection('countries');
    return await collection.findOne({ code, isActive: true });
  }

  static async create(db, data) {
    const collection = db.collection('countries');
    const validatedData = Country.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async update(db, id, data) {
    const collection = db.collection('countries');
    const updateData = { ...data, updatedAt: new Date() };
    return await collection.updateOne({ id }, { $set: updateData });
  }
} 