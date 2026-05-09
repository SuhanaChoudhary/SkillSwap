import mongoose from 'mongoose';

const toJSON = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    for (const k of ['requesterId', 'receiverId', 'listingId']) {
      if (ret[k] && typeof ret[k] === 'object' && ret[k]._id) {
        ret[k] = ret[k]._id.toString();
      }
    }
    return ret;
  },
};

const requestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    offerSkill: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, toJSON, toObject: toJSON }
);

export const Request = mongoose.model('Request', requestSchema);
