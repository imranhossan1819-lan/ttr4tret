import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, Sparkles, X, Globe, FileCode, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkGuideModalProps {
  isOpen: boolean;
  isBengali: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, isBengali, onClose }) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [downloadedOffline, setDownloadedOffline] = useState(false);

  if (!isOpen) return null;

  // The live hosted Cloud Run app URL
  const appUrl = 'https://ais-pre-7qtmfoo73i2cwmmuyvje2t-358553668221.asia-southeast1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?url=${encodeURIComponent(appUrl)}`;

  // Generate an offline standalone HTML launcher
  const handleDownloadOfflineHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>জোয়ার ভাটা ও মহাজাগতিক ট্র্যাকার (অফলাইন লাউঞ্চার)</title>
  <style>
    body { margin: 0; background: #030712; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; }
    .card { background: #091124; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; max-width: 450px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; font-size: 20px; margin-bottom: 10px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #06b6d4, #2563eb); color: white; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; margin-top: 15px; border: none; cursor: pointer; }
    .btn:hover { opacity: 0.9; }
    .badge { display: inline-block; background: #082f49; color: #38bdf8; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 15px; border: 1px solid #0284c7; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">PRO APK OFFLINE LAUNCHER</div>
    <h1>জোয়ার ভাটা ও মহাজাগতিক ট্র্যাকার</h1>
    <p>এই অফলাইন লঞ্চারটি আপনাকে সরাসরি মূল অ্যাপ্লিকেশনে নিয়ে যাবে এবং স্বয়ংক্রিয়ভাবে ফোনে ইন্সটল করবে।</p>
    <a href="${appUrl}" target="_blank" class="btn">অ্যাপ্লিকেশনটি চালু করুন (Open App)</a>
    <p style="margin-top: 20px; font-size: 12px; color: #64748b;">টিপস: ক্রোম ব্রাউজারে খোলার পর উপরের ৩-ডট মেনু থেকে "Install App" বা "Add to Home Screen" চাপুন।</p>
  </div>
  <script>
    // Auto redirect if online
    if (navigator.onLine) {
      setTimeout(() => { window.location.href = "${appUrl}"; }, 1000);
    }
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tide-Celestial-Tracker-App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedOffline(true);
    setTimeout(() => setDownloadedOffline(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{isBengali ? 'মোবাইল APK ডাউনলোড ও ইনস্টল' : 'Mobile APK Download & Install'}</span>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800">
                DIRECT APK
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isBengali ? 'কেন সরাসরি প্রিভিউ থেকে খুলছে না এবং কীভাবে ১-ক্লিকে ফোনে নেবেন' : 'Why it cannot open inside iframe & how to install'}
            </p>
          </div>
        </div>

        {/* Iframe Notice & Direct Open Action */}
        <div className="mt-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 p-3.5 text-xs text-amber-200 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{isBengali ? 'কেন প্রিভিউ ফ্রেমে APK ওপেন হয় না?' : 'Why APK prompt is blocked here?'}</span>
          </div>
          <p className="text-slate-300">
            {isBengali
              ? 'নিরাপত্তার জন্য গুগল ক্রোম ব্রাউজার প্রিভিউ উইন্ডো বা আইফ্রেমের ভেতরে সরাসরি APK ইন্সটল ডায়ালগ ব্লক করে রাখে। নিচের লিংকে চাপ দিয়ে ক্রোম ব্রাউজারে সরাসরি খুললেই অ্যান্ড্রয়েড ফোন স্বয়ংক্রিয়ভাবে APK প্যাকেজ তৈরি করে ইনস্টল করবে।'
              : 'Google Chrome blocks install prompts inside preview iframes. Open the direct link below in Chrome to trigger the native Android WebAPK installation.'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-4 space-y-2.5">
          {/* Method 1: Open Directly in Chrome / Browser for Native WebAPK */}
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-3.5 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-cyan-500 transition ring-1 ring-emerald-400/40"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Globe className="h-5 w-5 text-white shrink-0" />
              <div>
                <strong className="block text-sm font-bold">
                  {isBengali ? '১. ক্রোম ব্রাউজারে সরাসরি খুলুন (সবচেয়ে সহজ)' : '1. Open in Chrome Browser (Recommended)'}
                </strong>
                <span className="text-[11px] text-emerald-100 opacity-90">
                  {isBengali ? 'ক্রোমে খোলার পর স্বয়ংক্রিয়ভাবে APK ইনস্টল হবে' : 'Automatically prompts Android WebAPK install'}
                </span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-white" />
          </a>

          {/* Browser direct native install if available */}
          {isInstallable && (
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-600 hover:bg-cyan-500 p-3 text-sm font-bold text-white transition shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>{isBengali ? 'ডিভাইসে সরাসরি ইনস্টল করুন' : 'Direct Browser Install'}</span>
            </button>
          )}

          {/* Method 2: PWABuilder Android APK Generator */}
          <a
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 w-full rounded-2xl bg-slate-800 hover:bg-slate-750 p-3.5 text-slate-200 border border-slate-700 hover:border-slate-600 transition"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Smartphone className="h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <strong className="block text-xs sm:text-sm font-bold text-white">
                  {isBengali ? '২. PWABuilder দিয়ে সরাসরি .apk ফাইল তৈরি' : '2. Generate Standalone .APK File'}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {isBengali ? 'মাইক্রোসফটের অফিসিয়াল টুল দিয়ে সাইনড APK ডাউনলোড' : 'Download signed Android APK package'}
                </span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
          </a>

          {/* Method 3: Download Standalone Offline App HTML Package */}
          <button
            onClick={handleDownloadOfflineHtml}
            className="flex items-center justify-between gap-3 w-full rounded-2xl bg-slate-800/80 hover:bg-slate-750 p-3.5 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition"
          >
            <div className="flex items-center gap-2.5 text-left">
              <FileCode className="h-5 w-5 text-cyan-400 shrink-0" />
              <div>
                <strong className="block text-xs sm:text-sm font-bold text-white">
                  {isBengali ? '৩. অফলাইন অ্যাপ ফাইল ডাউনলোড (.html)' : '3. Download Offline Launcher (.html)'}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {downloadedOffline
                    ? (isBengali ? '✓ ফাইলটি আপনার ডিভাইসে ডাউনলোড হয়েছে!' : '✓ File downloaded to your device!')
                    : (isBengali ? 'যে কোনো ফোনে সেভ করে সরাসরি ওপেন করা যায়' : 'Open directly from phone storage')}
                </span>
              </div>
            </div>
            {downloadedOffline ? (
              <Check className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <Download className="h-4 w-4 shrink-0 text-slate-400" />
            )}
          </button>
        </div>

        {/* Quick Instructions */}
        <div className="mt-4 rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-white mb-1">
            {isBengali ? 'অ্যান্ড্রয়েড ফোনে ২ সেকেন্ডে যেভাবে করবেন:' : 'How to do on Android in 2 seconds:'}
          </div>
          <p>
            {isBengali
              ? '১. উপরের "ক্রোম ব্রাউজারে সরাসরি খুলুন" বাটনে চাপুন।'
              : '1. Click "Open in Chrome Browser" above.'}
          </p>
          <p>
            {isBengali
              ? '২. ক্রোম খুলে গেলে স্ক্রিনের নিচে "Add to Home screen" অথবা উপরের ৩-ডট মেনু (⋮) চাপ দিয়ে "Install app" চাপুন।'
              : '2. Once Chrome opens, tap the pop-up "Add to Home screen" or tap 3-dots (⋮) > "Install app".'}
          </p>
          <p>
            {isBengali
              ? '৩. এটি স্বয়ংক্রিয়ভাবে আপনার ফোনে অ্যাপ হিসেবে ইনস্টল হয়ে যাবে।'
              : '3. It instantly installs as an app on your phone.'}
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300 transition"
          >
            {isBengali ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
