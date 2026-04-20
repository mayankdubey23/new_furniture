import { Schema, model, models, type Types } from 'mongoose';

export interface IAdminRecoveryCode {
  adminId: Types.ObjectId;
  channel: 'email';
  purpose: 'password-recovery';
  destination: string;
  codeHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminRecoveryCodeSchema = new Schema<IAdminRecoveryCode>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['password-recovery'],
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    codeHash: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.AdminRecoveryCode ||
  model<IAdminRecoveryCode>('AdminRecoveryCode', AdminRecoveryCodeSchema);

