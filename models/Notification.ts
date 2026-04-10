import { Schema, model, models } from 'mongoose';
import type { OrderStatus } from '@/models/Order';

export interface INotification {
  email: string;
  type: 'order-status';
  orderId: string;
  trackingNumber?: string;
  status?: OrderStatus;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['order-status'],
      default: 'order-status',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    href: { type: String, trim: true },
    read: { type: Boolean, default: false, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ email: 1, createdAt: -1 });

export default models.Notification || model<INotification>('Notification', NotificationSchema);
