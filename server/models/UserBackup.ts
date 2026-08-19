import mongoose, { Schema, Model } from 'mongoose';

export interface IUserBackup {
  email: string;
  backupData: Record<string, any>;
  lastSyncedAt: Date;
  metadata?: Record<string, any>;
}

const UserBackupSchema = new Schema<IUserBackup>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    backupData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const UserBackup: Model<IUserBackup> =
  (mongoose.models.UserBackup as Model<IUserBackup>) ||
  mongoose.model<IUserBackup>('UserBackup', UserBackupSchema);
