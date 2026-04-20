import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminAccount {
  username?: string;
  email: string;
  phone?: string;
  password?: string;
  active: boolean;
  passwordUpdatedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminAccountSchema = new Schema<IAdminAccount>(
  {
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
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: { type: String },
    active: { type: Boolean, default: true },
    passwordUpdatedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AdminAccountSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;

  const looksHashed = /^\$2[aby]\$\d{2}\$/.test(this.password);
  if (looksHashed) return;

  this.password = await bcrypt.hash(this.password, 12);
});

export default models.AdminAccount || model<IAdminAccount>('AdminAccount', AdminAccountSchema);

