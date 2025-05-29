import { z } from 'zod';
import { randomUUID } from 'crypto';

export const SearchSchema = z.object({
  id: z.string().default(() => randomUUID()),
  fromCityId: z.number(),
  toCityId: z.number(),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  type: z.enum(['one-way', 'return', 'return-open']),
  createdAt: z.date().default(() => new Date()),
});

export class Search {
  constructor(data) {
    this.data = SearchSchema.parse(data);
  }

  static validate(data) {
    return SearchSchema.parse(data);
  }

  static async create(db, data) {
    const collection = db.collection('searches');
    const validatedData = Search.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async findById(db, id) {
    const collection = db.collection('searches');
    return await collection.findOne({ id });
  }

  static async deleteOld(db, olderThanHours = 24) {
    const collection = db.collection('searches');
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    return await collection.deleteMany({ createdAt: { $lt: cutoffDate } });
  }
} 