import { Schema, model, models, type Types } from 'mongoose';

export interface IWishlist {
  user: Types.ObjectId;
  product: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export default models.Wishlist || model<IWishlist>('Wishlist', WishlistSchema);
