import mongoose from 'mongoose';

const toJSON = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash; // never leak hashes
    return ret;
  },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },
  },
  { timestamps: true, toJSON, toObject: toJSON }
);

export const User = mongoose.model('User', userSchema);
