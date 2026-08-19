import { Request, Response } from 'express';
import crypto from 'crypto';
import { UserBackup } from '../models/UserBackup';
import { EmailOTP } from '../models/EmailOTP';
import { connectDB } from '../config/db';
import { sendOTPEmail } from '../config/nodemailer';

/**
 * Generates a random 5-digit numeric string (10000 - 99999)
 */
function generate5DigitCode(): string {
  const min = 10000;
  const max = 99999;
  const num = crypto.randomInt(min, max + 1);
  return num.toString();
}

export async function sendRestoreOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Invalid email address format.' });
      return;
    }

    await connectDB();

    // Check if a backup snapshot actually exists for this user
    const backupExists = await UserBackup.findOne({ email: cleanEmail });
    if (!backupExists) {
      res.status(404).json({
        success: false,
        message: `No cloud backup found for ${cleanEmail}. Please ensure you used this email when syncing your projects or perform a cloud backup first.`,
      });
      return;
    }

    // Generate random 5-digit numeric verification code
    const code = generate5DigitCode();

    // 24-hour expiration window
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Invalidate prior unused OTPs for this email to avoid confusion
    await EmailOTP.deleteMany({ email: cleanEmail });

    // Store new OTP in MongoDB
    await EmailOTP.create({
      email: cleanEmail,
      code,
      expiresAt,
      createdAt: new Date(),
      used: false,
    });

    // Dispatch email via Nodemailer
    try {
      await sendOTPEmail(cleanEmail, code);
      console.log(`✉️ 5-digit OTP sent to ${cleanEmail}: [${code}] (Valid for 24h)`);
    } catch (mailError: any) {
      console.error('Failed to dispatch verification email via Nodemailer:', mailError);
      res.status(500).json({
        success: false,
        message: `Failed to dispatch email to ${cleanEmail}. Please ensure ADMIN_EMAIL and ADMIN_EMAIL_PASSWORD are valid Google App Passwords.`,
        error: mailError.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `A 5-digit verification code has been dispatched to ${cleanEmail}. It will remain valid for 24 hours.`,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('Error in sendRestoreOTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while generating verification code.',
    });
  }
}

export async function verifyOTPAndRestore(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your Gmail and try again.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    await connectDB();

    // Look for active OTP
    const otpRecord = await EmailOTP.findOne({
      email: cleanEmail,
      code: cleanCode,
      used: false,
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your Gmail and try again.',
      });
      return;
    }

    // Check 24-hour expiration
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await EmailOTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your Gmail and try again.',
      });
      return;
    }

    // Retrieve user's cloud backup snapshot
    const backupRecord = await UserBackup.findOne({ email: cleanEmail });
    if (!backupRecord) {
      res.status(404).json({
        success: false,
        message: 'Cloud backup record not found for this account.',
      });
      return;
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'Data successfully restored!',
      backupData: backupRecord.backupData,
      lastSyncedAt: backupRecord.lastSyncedAt,
      email: backupRecord.email,
    });
  } catch (error: any) {
    console.error('Error in verifyOTPAndRestore:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during data restoration.',
    });
  }
}
