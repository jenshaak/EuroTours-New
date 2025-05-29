import { z } from 'zod';

export const CarrierSchema = z.object({
  id: z.number(),
  code: z.string(), // "FB" for FlixBus, "BLA" for BlaBlaCar
  name: z.string(),
  isExternal: z.boolean().default(false),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export class Carrier {
  constructor(data) {
    this.data = CarrierSchema.parse(data);
  }

  static validate(data) {
    return CarrierSchema.parse(data);
  }

  static async findAll(db) {
    const collection = db.collection('carriers');
    return await collection.find({ isActive: true }).toArray();
  }

  static async findByCode(db, code) {
    const collection = db.collection('carriers');
    return await collection.findOne({ code, isActive: true });
  }

  static async findExternal(db) {
    const collection = db.collection('carriers');
    return await collection.find({ isExternal: true, isActive: true }).toArray();
  }

  static async create(db, data) {
    const collection = db.collection('carriers');
    const validatedData = Carrier.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async update(db, id, data) {
    const collection = db.collection('carriers');
    const updateData = { ...data, updatedAt: new Date() };
    return await collection.updateOne({ id }, { $set: updateData });
  }
} 