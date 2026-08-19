import { Request, Response } from 'express';
import { UserBackup } from '../models/UserBackup';
import { connectDB, isMongoConnected } from '../config/db';

export async function saveBackup(req: Request, res: Response): Promise<void> {
  try {
    const { email, backupData, metadata } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'A valid email address is required for cloud backup.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
      return;
    }

    if (!backupData || typeof backupData !== 'object') {
      res.status(400).json({ success: false, message: 'backupData payload is required.' });
      return;
    }

    await connectDB();

    const now = new Date();
    const backupRecord = await UserBackup.findOneAndUpdate(
      { email: cleanEmail },
      {
        email: cleanEmail,
        backupData,
        lastSyncedAt: now,
        metadata: metadata || {},
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cloud backup synchronized successfully to MongoDB!',
      lastSyncedAt: backupRecord.lastSyncedAt,
      email: backupRecord.email,
    });
  } catch (error: any) {
    console.error('Error saving backup to MongoDB:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save cloud backup to database.',
    });
  }
}

export async function getBackupStatus(req: Request, res: Response): Promise<void> {
  try {
    const email = req.query.email as string;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email query parameter is required.' });
      return;
    }

    await connectDB();

    const cleanEmail = email.trim().toLowerCase();
    const backupRecord = await UserBackup.findOne({ email: cleanEmail });

    if (!backupRecord) {
      res.status(200).json({
        success: true,
        exists: false,
        lastSyncedAt: null,
        message: 'No cloud backup exists for this email yet.',
      });
      return;
    }

    const projects = backupRecord.backupData?.projects || [];
    res.status(200).json({
      success: true,
      exists: true,
      email: backupRecord.email,
      lastSyncedAt: backupRecord.lastSyncedAt,
      projectCount: Array.isArray(projects) ? projects.length : 0,
    });
  } catch (error: any) {
    console.error('Error fetching backup status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to query backup status.',
    });
  }
}
