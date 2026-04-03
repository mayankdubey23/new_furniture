import { Schema, model, models } from 'mongoose';

export interface IOrderItem {
  productId: string; // ObjectId ref Product
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface IOrder {
  items: IOrderItem[];
  totalItems: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  customer: ICustomerInfo;
  notes?: string;
  createdAt?: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const CustomerInfoSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    items: [OrderItemSchema],
    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      default: 'pending',
    },
    customer: { type: CustomerInfoSchema, required: true },
    notes: String,
  },
  { timestamps: true }
);

export default models.Order || model('Order', OrderSchema);
