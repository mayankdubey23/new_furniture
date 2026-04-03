import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomization extends Document {
  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Product Info
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  
  // Color Selection
  selectedFeaturedColor?: {
    name: string;
    hex: string;
  };
  customColorName?: string;
  customColorCode?: string;
  customColorPickerValue?: string;
  
  // Material & Finish
  selectedMaterial?: string;
  selectedFinish?: string;
  
  // Add-ons & Options
  selectedAddons: string[];
  sizeOrConfiguration?: string;
  
  // Customer Notes & References
  customDescription: string;
  uploadedReference?: string; // File path or URL
  
  // Delivery Preferences
  preferredContactMethod?: string;
  preferredCallTime?: string;
  deliveryCity?: string;
  expectedTimeline?: string;
  
  // Admin Status
  status: 'pending' | 'in-review' | 'approved' | 'contacted' | 'completed' | 'rejected';
  adminNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  completedAt?: Date;
}

const CustomizationSchema = new Schema<ICustomization>(
  {
    // Customer Info
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerPhone: { type: String, required: true },
    
    // Product Info
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    
    // Color Selection
    selectedFeaturedColor: {
      name: String,
      hex: String,
    },
    customColorName: String,
    customColorCode: String,
    customColorPickerValue: String,
    
    // Material & Finish
    selectedMaterial: String,
    selectedFinish: String,
    
    // Add-ons & Options
    selectedAddons: [String],
    sizeOrConfiguration: String,
    
    // Customer Notes & References
    customDescription: { type: String, maxlength: 1000 },
    uploadedReference: String,
    
    // Delivery Preferences
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email',
    },
    preferredCallTime: String,
    deliveryCity: String,
    expectedTimeline: String,
    
    // Admin Status
    status: {
      type: String,
      enum: ['pending', 'in-review', 'approved', 'contacted', 'completed', 'rejected'],
      default: 'pending',
    },
    adminNotes: String,
    
    // Timestamps
    contactedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CustomizationSchema.index({ customerEmail: 1 });
CustomizationSchema.index({ productId: 1 });
CustomizationSchema.index({ status: 1 });
CustomizationSchema.index({ createdAt: -1 });
CustomizationSchema.index({ selectedMaterial: 1 });
CustomizationSchema.index({ customColorName: 1 });

export default mongoose.models.Customization ||
  mongoose.model('Customization', CustomizationSchema);
