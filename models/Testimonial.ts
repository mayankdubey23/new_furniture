import { Schema, model, models, type Types } from 'mongoose';

export interface ITestimonial {
  user: Types.ObjectId;
  product?: Types.ObjectId | null;
  message: string;
  star: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
    message: { type: String, required: true, trim: true },
    star: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

export default models.Testimonial || model<ITestimonial>('Testimonial', TestimonialSchema);
