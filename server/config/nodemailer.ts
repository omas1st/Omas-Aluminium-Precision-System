import nodemailer from 'nodemailer';

export function createMailTransporter() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_EMAIL_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_EMAIL_PASSWORD not set in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: adminPassword ? adminPassword.replace(/\s+/g, '') : '', // strip accidental spaces in app password
    },
  });
}

export async function sendOTPEmail(toEmail: string, otpCode: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is not configured in server environment.');
  }

  const transporter = createMailTransporter();

  const mailOptions = {
    from: `"OMAS ALUMINIUM PRECISION SYSTEM" <${adminEmail}>`,
    to: toEmail,
    subject: `🔐 Your 5-Digit Verification Code: ${otpCode} - Data Restoration`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: #1e293b; padding: 24px; text-align: center; color: #ffffff; }
          .logo { display: inline-block; background: #3b82f6; color: #fff; font-weight: 800; font-size: 20px; width: 42px; height: 42px; line-height: 42px; border-radius: 8px; margin-bottom: 8px; }
          .title { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; color: #f8fafc; }
          .subtitle { font-size: 12px; color: #94a3b8; margin-top: 4px; }
          .content { padding: 32px 24px; text-align: center; }
          .intro { font-size: 15px; color: #475569; line-height: 1.5; margin-bottom: 24px; }
          .otp-box { display: inline-block; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px 36px; margin: 8px 0 24px 0; }
          .otp-digits { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; }
          .validity { font-size: 13px; font-weight: 600; color: #0284c7; margin-top: 4px; }
          .notice { font-size: 13px; color: #64748b; background: #f8fafc; padding: 14px; border-radius: 8px; text-align: left; line-height: 1.5; border-left: 4px solid #3b82f6; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">O</div>
            <div class="title">OMAS ALUMINIUM PRECISION SYSTEM</div>
            <div class="subtitle">Cloud Backup & Device Restoration Security</div>
          </div>
          <div class="content">
            <p class="intro">
              You requested to restore your architectural projects, cutting lists, and custom configuration onto this device.
            </p>
            <div class="otp-box">
              <div class="otp-digits">${otpCode}</div>
              <div class="validity">⏱️ Valid for 24 Hours</div>
            </div>
            <div class="notice">
              <strong>Security Notice:</strong><br>
              Enter this 5-digit verification code in your browser or mobile phone to restore all your saved projects, material prices, and fabrication calculations. If you did not request this code, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            OMAS Aluminium Pro Fabricator &bull; High-Precision Stock Optimization System &bull; Automatic Cloud Sync
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
