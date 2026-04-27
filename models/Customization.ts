import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomization extends Document {

  customerName: string;
  customerEmail: string;
  customerPhone: string;


  productId: string;
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
  deliveryCountry?: string;
  deliveryState?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliveryAddressLine1?: string;
  deliveryAddressLine2?: string;
  deliveryAddress?: string;
  expectedTimeline?: string;

  quoteCurrency?: string;
  quotedBaseUnitPrice?: number;
  quotedUnitPrice?: number;
  quotedBaseTotal?: number;
  quotedAdjustmentsTotal?: number;
  quotedGrandTotal?: number;
  quoteLineItems?: Array<{
    id?: string;
    label?: string;
    description?: string;
    unitAmount?: number;
    totalAmount?: number;
  }>;


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


    productId: { type: String, required: true, trim: true },
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
    deliveryCountry: {
      type: String,
      default: 'IN',
      trim: true,
      uppercase: true,
    },
    deliveryState: String,
    deliveryCity: String,
    deliveryPincode: String,
    deliveryAddressLine1: String,
    deliveryAddressLine2: String,
    deliveryAddress: String,
    expectedTimeline: String,

    quoteCurrency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    quotedBaseUnitPrice: { type: Number, min: 0, default: 0 },
    quotedUnitPrice: { type: Number, min: 0, default: 0 },
    quotedBaseTotal: { type: Number, min: 0, default: 0 },
    quotedAdjustmentsTotal: { type: Number, default: 0 },
    quotedGrandTotal: { type: Number, min: 0, default: 0 },
    quoteLineItems: [
      {
        id: String,
        label: String,
        description: String,
        unitAmount: Number,
        totalAmount: Number,
      },
    ],


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
