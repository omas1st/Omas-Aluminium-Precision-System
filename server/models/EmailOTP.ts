import mongoose, { Schema, Model } from 'mongoose';

export interface IEmailOTP {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
  used?: boolean;
}

const EmailOTPSchema = new Schema<IEmailOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailOTP: Model<IEmailOTP> =
  (mongoose.models.EmailOTP as Model<IEmailOTP>) ||
  mongoose.model<IEmailOTP>('EmailOTP', EmailOTPSchema);
