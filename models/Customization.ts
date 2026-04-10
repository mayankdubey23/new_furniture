import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomization extends Document {

  customerName: string;
  customerEmail: string;
  customerPhone: string;


  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;


  selectedFeaturedColor?: {
    name: string;
    hex: string;
  };
  customColorName?: string;
  customColorCode?: string;
  customColorPickerValue?: string;


  selectedMaterial?: string;
  selectedFinish?: string;


  selectedAddons: string[];
  sizeOrConfiguration?: string;


  customDescription: string;
  uploadedReference?: string;


  preferredContactMethod?: string;
  preferredCallTime?: string;
  deliveryCity?: string;
  expectedTimeline?: string;


  status: 'pending' | 'in-review' | 'approved' | 'contacted' | 'completed' | 'rejected';
  adminNotes?: string;


  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  completedAt?: Date;
}

const CustomizationSchema = new Schema<ICustomization>(
  {

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerPhone: { type: String, required: true },


    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },


    selectedFeaturedColor: {
      name: String,
      hex: String,
    },
    customColorName: String,
    customColorCode: String,
    customColorPickerValue: String,


    selectedMaterial: String,
    selectedFinish: String,


    selectedAddons: [String],
    sizeOrConfiguration: String,


    customDescription: { type: String, maxlength: 1000 },
    uploadedReference: String,


    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email',
    },
    preferredCallTime: String,
    deliveryCity: String,
    expectedTimeline: String,


    status: {
      type: String,
      enum: ['pending', 'in-review', 'approved', 'contacted', 'completed', 'rejected'],
      default: 'pending',
    },
    adminNotes: String,


    contactedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);


CustomizationSchema.index({ customerEmail: 1 });
CustomizationSchema.index({ productId: 1 });
CustomizationSchema.index({ status: 1 });
CustomizationSchema.index({ createdAt: -1 });
CustomizationSchema.index({ selectedMaterial: 1 });
CustomizationSchema.index({ customColorName: 1 });

export default mongoose.models.Customization ||
  mongoose.model('Customization', CustomizationSchema);
