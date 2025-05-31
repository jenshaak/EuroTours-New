import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  passenger: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    dateOfBirth: z.string().optional(),
    documentNumber: z.string().optional()
  }),
  paymentMethod: z.enum(['card', 'coinremitter', 'coinbase', 'onchainkit']),
  cryptoCurrency: z.string().optional(),
  totalPrice: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'paid', 'failed', 'expired', 'cancelled', 'completed']).default('pending'),
  paymentId: z.string().optional(), // External payment ID (Coinbase charge ID, etc.)
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export class Order {
  constructor(data) {
    this.data = OrderSchema.parse(data);
  }

  static validate(data) {
    return OrderSchema.parse(data);
  }

  static async create(db, data) {
    const collection = db.collection('orders');
    const validatedData = Order.validate(data);
    const result = await collection.insertOne(validatedData);
    return { ...validatedData, _id: result.insertedId };
  }

  static async findById(db, id) {
    const collection = db.collection('orders');
    return await collection.findOne({ id });
  }

  static async getById(db, id) {
    return await Order.findById(db, id);
  }

  static async findByPaymentId(db, paymentId) {
    const collection = db.collection('orders');
    return await collection.findOne({ paymentId });
  }

  static async updateStatus(db, id, status, paymentId = null) {
    const collection = db.collection('orders');
    const updateData = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    
    return await collection.updateOne(
      { id }, 
      { $set: updateData }
    );
  }

  static async findByEmail(db, email) {
    const collection = db.collection('orders');
    return await collection.find({ 'passenger.email': email }).toArray();
  }

  static async findPendingOrders(db) {
    const collection = db.collection('orders');
    return await collection.find({ status: 'pending' }).toArray();
  }
} 