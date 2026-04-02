import { Schema, model, models } from 'mongoose';

export interface IOrderItem {
  productId: string; // ObjectId ref Product
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IOrder {
  items: IOrderItem[];
  totalItems: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  userId?: string; // optional for guest carts
  createdAt?: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>({
  items: [OrderItemSchema],
  totalItems: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  userId: String,
}, { timestamps: true });

export default models.Order || model('Order', OrderSchema);

