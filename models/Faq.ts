import { Schema, model, models } from 'mongoose';

export interface IFaq {
  question: string;
  answer: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Faq || model<IFaq>('Faq', FaqSchema);
