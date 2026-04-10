import { Schema, model, models } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone: string;
  country?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  address: string;
  city: string;
  pincode: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrderStatusTimelineEntry {
  status: OrderStatus;
  title: string;
  message: string;
  createdAt: Date;
}

export interface IOrder {
  items: IOrderItem[];
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  statusTimeline?: IOrderStatusTimelineEntry[];
  customer: ICustomerInfo;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider?: 'razorpay';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: Date;
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
  country: { type: String, default: 'IN' },
  state: String,
  addressLine1: String,
  addressLine2: String,
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
});

const OrderStatusTimelineSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false }
);

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
    trackingNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,
    statusTimeline: {
      type: [OrderStatusTimelineSchema],
      default: [],
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay'],
      default: 'cod',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay'],
    },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    paidAt: Date,
    customer: { type: CustomerInfoSchema, required: true },
    notes: String,
  },
  { timestamps: true }
);

export default models.Order || model('Order', OrderSchema);
