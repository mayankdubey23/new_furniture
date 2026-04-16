import { Schema, model, models, type Types } from 'mongoose';

export interface IAddress {
  user: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  pin: string;
  city: string;
  state: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pin: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default models.Address || model<IAddress>('Address', AddressSchema);
