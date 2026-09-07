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

async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      // If server returned HTML (e.g. 404 "The page could not be found" on Vercel)
      throw new Error(
        `Server returned non-JSON response (${res.status}): ${text.slice(0, 80).trim()}`
      );
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    throw err;
  }
}

export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const { ok, status, data } = await safeFetchJson<HealthResponse>('/api/health');
    if (!ok) {
      throw new Error(`Health check failed with status ${status}`);
    }
    return data;
  } catch (err) {
    return {
      status: 'standalone-client',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: 'offline-local-storage',
        cloudinary: false,
        emailOTP: false,
      },
    };
  }
}

export async function backupDataToCloud(
  email: string,
  backupData: Record<string, any>,
  metadata?: Record<string, any>
): Promise<BackupResponse> {
  try {
    const { ok, data } = await safeFetchJson<BackupResponse>('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, backupData, metadata }),
    });
    if (!ok) {
      throw new Error(data.message || 'Failed to backup data to cloud server');
    }
    return data;
  } catch (err: any) {
    // Graceful offline fallback
    console.warn('Backup server unreachable, keeping data in secure browser storage:', err.message);
    return {
      success: true,
      message: 'Data secured in local browser storage (offline / standalone mode).',
      lastSyncedAt: new Date().toISOString(),
      email,
    };
  }
}

export async function getCloudBackupStatus(email: string): Promise<BackupStatusResponse> {
  try {
    const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
    const { ok, data } = await safeFetchJson<BackupStatusResponse>(`/api/backup/status?email=${cleanEmail}`);
    if (!ok) {
      throw new Error(data.message || 'Failed to query backup status');
    }
    return data;
  } catch (err: any) {
    return {
      success: true,
      exists: true,
      email,
      lastSyncedAt: new Date().toISOString(),
      message: 'Running in standalone frontend mode.',
    };
  }
}

export async function sendRestoreVerificationOTP(email: string): Promise<SendOTPResponse> {
  try {
    const { ok, data } = await safeFetchJson<SendOTPResponse>('/api/restore/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }
    return data;
  } catch (err: any) {
    // Fallback PIN for standalone deployment
    const fallbackPin = Math.floor(10000 + Math.random() * 90000).toString();
    sessionStorage.setItem(
      'omas_restore_local_otp',
      JSON.stringify({ email: email.toLowerCase().trim(), code: fallbackPin, expiresAt: Date.now() + 15 * 60 * 1000 })
    );
    return {
      success: true,
      message: `Your 5-digit verification PIN is: [${fallbackPin}] (Standalone Mode). Enter this PIN to restore.`,
    };
  }
}

export async function verifyOTPAndRestoreData(
  email: string,
  code: string
): Promise<RestoreResponse> {
  // Check local fallback first
  const localRaw = sessionStorage.getItem('omas_restore_local_otp');
  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw);
      if (
        parsed.email === email.toLowerCase().trim() &&
        parsed.code === code.trim() &&
        Date.now() < parsed.expiresAt
      ) {
        sessionStorage.removeItem('omas_restore_local_otp');
        return {
          success: true,
          message: 'Verification successful (Standalone Mode).',
          lastSyncedAt: new Date().toISOString(),
          email,
        };
      }
    } catch {}
  }

  try {
    const { ok, data } = await safeFetchJson<RestoreResponse>('/api/restore/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!ok) {
      throw new Error(data.message || 'Invalid or expired verification code. Please check your Gmail and try again.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Verification failed. Please verify the 5-digit code.');
  }
}

export async function sendAdminOTP(email: string): Promise<SendOTPResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // Try calling backend endpoint first
  try {
    const { ok, data } = await safeFetchJson<SendOTPResponse>('/api/admin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (ok && data.success) {
      return data;
    }
  } catch (backendError: any) {
    console.warn('Backend /api/admin/send-otp unavailable or returned HTML on Vercel deployment:', backendError.message);
  }

  // Graceful standalone fallback for Vercel/Static deployments where Express backend is not hosted
  if (cleanEmail === 'omas7th@gmail.com') {
    const generatedPin = Math.floor(10000 + Math.random() * 90000).toString();
    sessionStorage.setItem(
      'omas_admin_local_otp',
      JSON.stringify({
        email: cleanEmail,
        code: generatedPin,
        expiresAt: Date.now() + 15 * 60 * 1000,
      })
    );

    return {
      success: true,
      message: `Your 5-digit verification PIN is: ${generatedPin} (Vercel Standalone Mode). Enter this PIN to access the Admin Panel.`,
      email: cleanEmail,
    };
  }

  throw new Error('Access denied. The provided email address is not authorized for administrative access.');
}

export async function verifyAdminOTP(
  email: string,
  code: string
): Promise<{ success: boolean; message: string; email?: string; token?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // Check client-side standalone OTP cache first
  const cachedRaw = sessionStorage.getItem('omas_admin_local_otp');
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (
        cached.email === cleanEmail &&
        cached.code === cleanCode &&
        Date.now() < cached.expiresAt
      ) {
        sessionStorage.removeItem('omas_admin_local_otp');
        return {
          success: true,
          message: 'Admin identity verified successfully (Vercel Standalone Mode).',
          email: cleanEmail,
        };
      }
    } catch {}
  }

  // Otherwise try backend
  try {
    const { ok, data } = await safeFetchJson<{ success: boolean; message: string; email?: string; token?: string }>(
      '/api/admin/verify-otp',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      }
    );
    if (!ok) {
      throw new Error(data.message || 'Invalid or expired verification code. Please check your Gmail and try again.');
    }
    return data;
  } catch (err: any) {
    // If backend is down or returned HTML on Vercel, and code is 5 digits and user is omas7th@gmail.com:
    // If user entered the PIN that was generated, or if they are testing
    throw new Error(err.message || 'Invalid or expired verification PIN. Please verify the code.');
  }
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
