import { Router, Request, Response } from 'express';
import { saveBackup, getBackupStatus } from '../controllers/backupController';
import { sendRestoreOTP, verifyOTPAndRestore } from '../controllers/authRestoreController';
import { sendAdminOTP, verifyAdminOTP } from '../controllers/adminAuthController';
import { uploadMedia } from '../controllers/uploadController';
import { isMongoConnected } from '../config/db';

const router = Router();

// Health Check & Cloud Services Status
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: isMongoConnected() ? 'connected' : 'disconnected',
      cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      emailOTP: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD),
    },
  });
});

// Cloud Backup Routes
router.post('/backup', saveBackup);
router.get('/backup/status', getBackupStatus);

// Restore & 5-Digit Gmail OTP Routes
router.post('/restore/send-otp', sendRestoreOTP);
router.post('/restore/verify-otp', verifyOTPAndRestore);

// Admin Panel 5-Digit Gmail OTP Authentication Routes (omas7th@gmail.com)
router.post('/admin/send-otp', sendAdminOTP);
router.post('/admin/verify-otp', verifyAdminOTP);

// Media Upload (Cloudinary)
router.post('/upload', uploadMedia);

export default router;
