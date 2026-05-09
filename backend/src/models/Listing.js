import mongoose from 'mongoose';

const toJSON = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    if (ret.ownerId && typeof ret.ownerId === 'object' && ret.ownerId._id) {
      ret.ownerId = ret.ownerId._id.toString();
    }
    return ret;
  },
};

const listingSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, trim: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, toJSON, toObject: toJSON }
);

// Compound text index so search hits all 3 fields
listingSchema.index({ skillName: 'text', description: 'text', category: 'text' });

export const Listing = mongoose.model('Listing', listingSchema);
