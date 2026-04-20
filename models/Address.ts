import { Schema, model, models, type Types } from 'mongoose';

export interface IAddress {
  user: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  country?: string;
  addressLine1?: string;
  addressLine2?: string;
  address: string;
  pin: string;
  pincode?: string;
  city: string;
  state: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, default: 'IN', trim: true, uppercase: true },
    addressLine1: { type: String, default: '', trim: true },
    addressLine2: { type: String, default: '', trim: true },
    address: { type: String, required: true, trim: true },
    pin: { type: String, required: true, trim: true },
    pincode: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Address || model<IAddress>('Address', AddressSchema);
