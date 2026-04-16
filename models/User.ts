import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  username?: string;
  email: string;
  password?: string;
  googleId?: string;
  phone?: string;
  phoneVerifiedAt?: Date | null;
  role?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    phoneVerifiedAt: { type: Date, default: null },
    role: { type: String, default: 'Buyer', trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('validate', function ensureUsername() {
  if (this.username?.trim()) {
    this.username = this.username.trim().toLowerCase();
    return;
  }

  const emailLocalPart = String(this.email || '')
    .trim()
    .toLowerCase()
    .split('@')[0];
  const nameFallback = String(this.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  this.username = emailLocalPart || nameFallback || undefined;
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export default models.User || model<IUser>('User', UserSchema);
