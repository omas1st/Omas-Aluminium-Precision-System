import { Request, Response } from 'express';
import crypto from 'crypto';
import { EmailOTP } from '../models/EmailOTP';
import { connectDB } from '../config/db';
import { sendOTPEmail } from '../config/nodemailer';

export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'omas7th@gmail.com').toLowerCase().trim();

/**
 * Generates a random 5-digit numeric string (10000 - 99999)
 */
function generate5DigitCode(): string {
  const min = 10000;
  const max = 99999;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Sends a 5-digit verification code to the authorized admin email (omas7th@gmail.com)
 */
export async function sendAdminOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please provide the admin Gmail address.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify if the input email matches the designated admin email
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL && cleanEmail !== 'omas7th@gmail.com') {
      res.status(403).json({
        success: false,
        message: 'Access denied. The provided email address is not authorized for administrative access.',
      });
      return;
    }

    await connectDB();

    // Generate 5-digit code
    const code = generate5DigitCode();

    // 24-hour expiration window
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Clean up previous OTPs for admin
    await EmailOTP.deleteMany({ email: cleanEmail });

    // Store in MongoDB
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
      console.log(`🔐 Admin 5-digit OTP dispatched to administrator Gmail: [${code}]`);
    } catch (mailError: any) {
      console.error('Failed to send admin verification email via Nodemailer:', mailError);
      res.status(500).json({
        success: false,
        message: 'Failed to dispatch verification code to administrator Gmail. Please check email service configuration.',
        error: mailError.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'A 5-digit verification code has been dispatched to your Gmail. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Error in sendAdminOTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while generating admin OTP.',
    });
  }
}

/**
 * Verifies the 5-digit OTP for admin access
 */
export async function verifyAdminOTP(req: Request, res: Response): Promise<void> {
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

    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL && cleanEmail !== 'omas7th@gmail.com') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized email address.',
      });
      return;
    }

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

    // Check expiration
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await EmailOTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
      return;
    }

    // Mark code as used
    otpRecord.used = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'Admin identity successfully verified.',
      email: cleanEmail,
      token: crypto.randomBytes(24).toString('hex'),
    });
  } catch (error: any) {
    console.error('Error in verifyAdminOTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during admin verification.',
    });
  }
}
