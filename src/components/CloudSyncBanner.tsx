import React, { useState, useEffect } from 'react';
import {
  getLastSyncedAt,
  getSavedSyncEmail,
  setSavedSyncEmail,
  syncLocalDataToCloud,
  checkAndRunDailyBackgroundSync,
} from '../utils/cloudSync';
import {
  CloudUpload,
  CloudCheck,
  RefreshCw,
  Clock,
  ShieldCheck,
  Mail,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import './CloudSyncBanner.css';

interface CloudSyncBannerProps {
  onOpenRestoreModal: () => void;
  onSyncComplete?: () => void;
  compact?: boolean;
}

export const CloudSyncBanner: React.FC<CloudSyncBannerProps> = ({
  onOpenRestoreModal,
  onSyncComplete,
  compact = false,
}) => {
  const [email, setEmail] = useState<string>(getSavedSyncEmail());
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!getSavedSyncEmail());
  const [lastSynced, setLastSynced] = useState<string | null>(getLastSyncedAt());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialize and run daily background sync check
  useEffect(() => {
    checkAndRunDailyBackgroundSync().then((synced) => {
      if (synced) {
        setLastSynced(getLastSyncedAt());
      }
    });

    const handleSyncEvent = (e: any) => {
      setLastSynced(e.detail?.lastSyncedAt || getLastSyncedAt());
    };

    window.addEventListener('omas_cloud_synced', handleSyncEvent);
    return () => window.removeEventListener('omas_cloud_synced', handleSyncEvent);
  }, []);

  const handleManualSync = async () => {
    if (!email.trim() || !email.includes('@')) {
      setIsEditingEmail(true);
      setSyncStatus({
        type: 'error',
        message: 'Please provide a valid Gmail/email address before syncing.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      setSavedSyncEmail(email.trim());
      const res = await syncLocalDataToCloud(email.trim());
      setLastSynced(res.lastSyncedAt);
      setIsEditingEmail(false);
      setSyncStatus({
        type: 'success',
        message: 'Snapshot backed up to MongoDB successfully!',
      });
      if (onSyncComplete) onSyncComplete();

      // Clear success notification after 4 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 4000);
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Failed to sync to cloud database.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return 'Never synced yet';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className={`cloud-sync-container ${compact ? 'py-2 px-3' : ''}`}>
      {/* Left Info: Local-first + Daily Cloud Backup Status */}
      <div className="cloud-sync-left">
        <div className="cloud-sync-icon-badge">
          <Database className="w-5 h-5 text-blue-400" />
        </div>
        <div className="cloud-sync-info">
          <h3>
            <span>Local-First Fast Engine & MongoDB Cloud Backup</span>
            <span className="cloud-sync-status-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Daily Auto-Sync Active
            </span>
          </h3>
          <p className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              <strong>Last synced:</strong> {formatLastSyncTime(lastSynced)}
            </span>
            {email && !isEditingEmail && (
              <>
                <span>&bull;</span>
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-blue-400 hover:text-blue-300 text-[11px] underline"
                >
                  edit
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Actions: Email Input, Sync Button, Restore Button */}
      <div className="cloud-sync-actions">
        {isEditingEmail && (
          <div className="flex items-center gap-1">
            <input
              type="email"
              placeholder="Enter backup Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cloud-sync-email-input"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="cloud-sync-btn"
          title="Backup all local cutting data and settings to MongoDB"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Backing up...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5 text-white" />
              <span>Sync / Backup to Cloud</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenRestoreModal}
          className="cloud-restore-btn"
          title="Restore your data on a new device via 5-Digit Gmail OTP"
        >
          <CloudDownload className="w-3.5 h-3.5 text-blue-300" />
          <span>Restore Data (OTP)</span>
        </button>
      </div>

      {/* Sync Status Alert Banner if present */}
      {syncStatus && (
        <div
          className={`w-full mt-2 text-xs py-1.5 px-3 rounded-lg flex items-center gap-2 ${
            syncStatus.type === 'success'
              ? 'bg-emerald-900/60 border border-emerald-700 text-emerald-200'
              : 'bg-red-900/60 border border-red-700 text-red-200'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span>{syncStatus.message}</span>
        </div>
      )}
    </div>
  );
};
