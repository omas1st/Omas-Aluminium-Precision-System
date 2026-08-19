/**
 * Frontend API Service for communicating with backend `/api/*` endpoints
 */

export interface BackupResponse {
  success: boolean;
  message: string;
  lastSyncedAt?: string;
  email?: string;
}

export interface BackupStatusResponse {
  success: boolean;
  exists: boolean;
  email?: string;
  lastSyncedAt?: string;
  projectCount?: number;
  message?: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

export interface RestoreResponse {
  success: boolean;
  message: string;
  backupData?: Record<string, any>;
  lastSyncedAt?: string;
  email?: string;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    mongodb: string;
    cloudinary: boolean;
    emailOTP: boolean;
  };
}

export async function checkServerHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function backupDataToCloud(
  email: string,
  backupData: Record<string, any>,
  metadata?: Record<string, any>
): Promise<BackupResponse> {
  const res = await fetch('/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, backupData, metadata }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to backup data to MongoDB');
  }
  return data;
}

export async function getCloudBackupStatus(email: string): Promise<BackupStatusResponse> {
  const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
  const res = await fetch(`/api/backup/status?email=${cleanEmail}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to query backup status');
  }
  return data;
}

export async function sendRestoreVerificationOTP(email: string): Promise<SendOTPResponse> {
  const res = await fetch('/api/restore/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to send verification code');
  }
  return data;
}

export async function verifyOTPAndRestoreData(
  email: string,
  code: string
): Promise<RestoreResponse> {
  const res = await fetch('/api/restore/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid or expired verification code. Please check your Gmail and try again.');
  }
  return data;
}

export async function sendAdminOTP(email: string): Promise<SendOTPResponse> {
  const res = await fetch('/api/admin/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to send admin verification code');
  }
  return data;
}

export async function verifyAdminOTP(
  email: string,
  code: string
): Promise<{ success: boolean; message: string; email?: string; token?: string }> {
  const res = await fetch('/api/admin/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid or expired verification code. Please check your Gmail and try again.');
  }
  return data;
}

export async function uploadImageToCloud(
  imageDataUri: string,
  folder: string = 'omas_aluminium'
): Promise<UploadResponse> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUri, folder }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to upload image to Cloudinary');
  }
  return data;
}
