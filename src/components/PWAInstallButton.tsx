import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'header' | 'card' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone PWA mode, show verified installed badge or nothing
  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowGenericModal(true);
    }
  };

  // 1. Compact / Header button for Navbar
  if (variant === 'header' || variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isInstallable
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          } ${className}`}
          title="Install OMAS Aluminium as an offline desktop/phone app"
        >
          <Download className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
          <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
        </button>

        {/* iOS Step-by-Step Instructions Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Run full-screen and offline without Safari browser bars</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 text-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-slate-200">
                      In Safari, tap the <strong className="text-blue-400">Share</strong> button in the bottom bar.
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Share className="w-4 h-4 text-blue-400" />
                      <span>Look for the square icon with an upward arrow</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-slate-200">
                      Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                      <span>Creates an OMAS App icon on your home screen</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-slate-200">
                      Tap <strong className="text-blue-400">"Add"</strong> in the top-right corner.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Launch the app directly from your home screen — it will operate 100% offline!
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-colors"
              >
                Got It, Close Guide
              </button>
            </div>
          </div>
        )}

        {/* Generic Install Instructions Modal (for PC Chrome/Edge or Android menu) */}
        {showGenericModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
              <button
                type="button"
                onClick={() => setShowGenericModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Install Offline App</h3>
                  <p className="text-xs text-slate-400">Install to PC, Mac, Chromebook, or Android device</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-blue-400" />
                    <span>On PC / Mac / Chrome / Edge:</span>
                  </div>
                  <p className="text-slate-400 pl-5">
                    Click the <strong>Install App icon (computer/download symbol)</strong> on the right side of the browser URL address bar, or click <strong>Settings (⋮) &rarr; "Install OMAS ALUMINIUM"</strong>.
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-700">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>On Android Phone / Tablet:</span>
                  </div>
                  <p className="text-slate-400 pl-5">
                    Tap the browser menu <strong>(⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGenericModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // 2. Card Variant (e.g. for Launchpad or Home page banner)
  return (
    <div
      className={`p-4 rounded-2xl border bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-blue-800/60 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 shrink-0">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm sm:text-base">Install OMAS as Standalone App</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Offline Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Works without internet on Android phones, iPhones, iPads, Windows, and Mac. Save cutting jobs and render 3D models right in the workshop.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleInstallClick}
        className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
      >
        <Download className="w-4 h-4" />
        <span>{isIOS ? 'Install on iPhone / iPad' : 'Install Offline App'}</span>
      </button>
    </div>
  );
};
