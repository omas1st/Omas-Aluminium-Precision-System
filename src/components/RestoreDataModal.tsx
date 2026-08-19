import React, { useState, useRef, useEffect } from 'react';
import {
  sendRestoreVerificationOTP,
  verifyOTPAndRestoreData,
} from '../services/api';
import {
  applyCloudSnapshotToLocalStorage,
  getSavedSyncEmail,
  setSavedSyncEmail,
} from '../utils/cloudSync';
import {
  CloudDownload,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Layers,
} from 'lucide-react';
import './RestoreDataModal.css';

interface RestoreDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const RestoreDataModal: React.FC<RestoreDataModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState<string>(getSavedSyncEmail());
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [restoredSummary, setRestoredSummary] = useState<{
    projectsCount: number;
    lastSyncedAt?: string;
  } | null>(null);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail(getSavedSyncEmail());
      setOtpDigits(['', '', '', '', '']);
      setErrorMessage(null);
      setInfoMessage(null);
      setRestoredSummary(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await sendRestoreVerificationOTP(email.trim());
      setSavedSyncEmail(email.trim());
      setStep('otp');
      setInfoMessage(res.message || `A 5-digit verification code has been dispatched to ${email}. Valid for 24 hours.`);
      // Focus first OTP input
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, ''); // Numbers only
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // Handle paste
      const pastedChars = clean.slice(0, 5).split('');
      for (let i = 0; i < 5; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedChars.length, 4);
      digitInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    // Auto move to next input
    if (clean && index < 4) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('').trim();

    if (fullCode.length !== 5) {
      setErrorMessage('Please enter all 5 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOTPAndRestoreData(email.trim(), fullCode);

      if (res.success && res.backupData) {
        // Write snapshot directly to local storage
        applyCloudSnapshotToLocalStorage(res.backupData);
        setSavedSyncEmail(email.trim());

        const projects = res.backupData.projects || [];
        setRestoredSummary({
          projectsCount: Array.isArray(projects) ? projects.length : 0,
          lastSyncedAt: res.lastSyncedAt,
        });

        setStep('success');
        onRestoreSuccess();
      } else {
        setErrorMessage('Invalid or expired verification code. Please check your Gmail and try again.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Invalid or expired verification code. Please check your Gmail and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="restore-modal-backdrop" onClick={onClose}>
      <div
        className="restore-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="restore-modal-header">
          <div className="restore-modal-title">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300">
              <CloudDownload className="w-5 h-5" />
            </div>
            <div>
              <h2>Restore Data on New Device</h2>
              <p>5-Digit Gmail OTP Cloud Snapshot Recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="restore-modal-close-btn"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="restore-modal-body">
          {/* Step Indicator */}
          <div className="restore-step-indicator">
            <div className={`restore-step-pill ${step === 'email' ? 'active' : ''}`}>
              <span className="restore-step-number">1</span>
              <span>Enter Email</span>
            </div>
            <span className="text-slate-300">&bull;&bull;&bull;</span>
            <div className={`restore-step-pill ${step === 'otp' ? 'active' : ''}`}>
              <span className="restore-step-number">2</span>
              <span>5-Digit Code</span>
            </div>
            <span className="text-slate-300">&bull;&bull;&bull;</span>
            <div className={`restore-step-pill ${step === 'success' ? 'active' : ''}`}>
              <span className="restore-step-number">3</span>
              <span>Restored!</span>
            </div>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="restore-alert-banner restore-alert-error">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Restoration Notice:</strong>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Info Alert Banner */}
          {infoMessage && step === 'otp' && (
            <div className="restore-alert-banner restore-alert-info">
              <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>{infoMessage}</div>
            </div>
          )}

          {/* STEP 1: EMAIL INPUT */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Registered Cloud Backup Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. omas7th@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  We will dispatch a secure 5-digit OTP to your Gmail to verify device ownership.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Restoring data brings back all your saved architectural cutting projects, custom prices, and fabrication formulas directly onto this browser.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="restore-primary-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 5-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enter 5-Digit Verification Code
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Sent to <strong className="text-slate-800">{email}</strong> &bull; Valid for 24 Hours
                </p>

                {/* 5 Distinct Input Boxes */}
                <div className="otp-digit-inputs-group">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (digitInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="otp-digit-box"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 5}
                className="restore-primary-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code & Restoring Snapshot...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify & Restore Data</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Change Email Address
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Data successfully restored!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  All your saved projects, custom aluminum formulas, and cutting profiles have been recovered into local storage.
                </p>
              </div>

              {restoredSummary && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2 text-left">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Recovered Projects:
                    </span>
                    <span className="font-mono text-sm bg-emerald-200/60 px-2 py-0.5 rounded">
                      {restoredSummary.projectsCount} Projects
                    </span>
                  </div>
                  {restoredSummary.lastSyncedAt && (
                    <div className="text-[11px] text-emerald-700 flex justify-between border-t border-emerald-200 pt-1.5">
                      <span>Cloud Snapshot Date:</span>
                      <span className="font-mono">
                        {new Date(restoredSummary.lastSyncedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="restore-primary-btn bg-emerald-600 hover:bg-emerald-700"
              >
                <span>Continue to Projects</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
