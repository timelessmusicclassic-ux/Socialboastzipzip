import React, { useState, useEffect } from 'react';
import {
  Globe,
  Wifi,
  WifiOff,
  Wallet,
  ShieldCheck,
  RefreshCw,
  Plus,
  Cloud,
  ChevronDown,
  Layers,
  Sparkles,
  Key,
  LogOut,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { storage } from '../services/storage';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenComposer: () => void;
  onOpenSyncQueue: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  walletBalance: number;
  profile: UserProfile;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeposit,
  onOpenComposer,
  onOpenSyncQueue,
  onOpenAuthModal,
  onSignOut,
  walletBalance,
  profile,
  onSyncCloud,
  isSyncing
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(storage.isOnline());
  const [offlineCount, setOfflineCount] = useState(storage.getOfflineQueue().length);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSimulatePrompt, setShowSimulatePrompt] = useState(false);
  const [pendingFundingCount, setPendingFundingCount] = useState(() => {
    return storage.getFundingRequests().filter(r => r.status === 'pending').length;
  });

  useEffect(() => {
    const handleConnectivity = () => {
      setIsOnline(storage.isOnline());
    };
    const handleQueue = (e: any) => {
      setOfflineCount(e.detail?.count ?? storage.getOfflineQueue().length);
    };
    const handleFundingUpdate = () => {
      setPendingFundingCount(storage.getFundingRequests().filter(r => r.status === 'pending').length);
    };

    window.addEventListener('online', handleConnectivity);
    window.addEventListener('offline', handleConnectivity);
    window.addEventListener('rss_connectivity_change', handleConnectivity);
    window.addEventListener('rss_queue_updated', handleQueue);
    window.addEventListener('rss_funding_requests_updated', handleFundingUpdate);
    window.addEventListener('rss_storage_changed', handleFundingUpdate);

    return () => {
      window.removeEventListener('online', handleConnectivity);
      window.removeEventListener('offline', handleConnectivity);
      window.removeEventListener('rss_connectivity_change', handleConnectivity);
      window.removeEventListener('rss_queue_updated', handleQueue);
      window.removeEventListener('rss_funding_requests_updated', handleFundingUpdate);
      window.removeEventListener('rss_storage_changed', handleFundingUpdate);
    };
  }, []);

  const toggleOfflineMode = () => {
    const currentForced = storage.getForceOffline();
    storage.setForceOffline(!currentForced);
    setIsOnline(!currentForced ? false : navigator.onLine);
    setShowSimulatePrompt(true);
    setTimeout(() => setShowSimulatePrompt(false), 3500);
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'scheduler', label: 'Post Scheduler' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'smm', label: 'Growth Panel' },
    { id: 'wallet', label: 'Wallet & Billing' },
    { id: 'storage', label: 'Cloud Storage' },
    { id: 'security', label: 'Profile & Security' },
    { id: 'admin', label: 'Admin Dashboard', isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner if Offline or forced offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
              <span>
                <strong>Offline Mode Active:</strong> All post schedules, orders & edits are securely stored locally in your browser and queued for cloud synchronization.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {offlineCount > 0 && (
                <button
                  onClick={onOpenSyncQueue}
                  className="bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded text-xs transition"
                >
                  {offlineCount} Pending Sync
                </button>
              )}
              <button
                onClick={toggleOfflineMode}
                className="bg-white text-amber-900 font-semibold px-2 py-0.5 rounded text-xs shadow-sm hover:bg-amber-50 transition"
              >
                Reconnect Online
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition duration-200">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">
                    Really Simple <span className="text-indigo-600">Social</span>
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-200">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Social Growth & Automated Cloud Synchronization
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Status Pill Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud & Offline State Pill */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                onClick={toggleOfflineMode}
                title={isOnline ? 'Click to simulate offline sync mode' : 'Click to go back online'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                  isOnline
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'bg-amber-500 text-white shadow-sm'
                }`}
              >
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Offline Mode</span>
                  </>
                )}
              </button>

              {/* Sync Trigger / Queue Button */}
              <button
                onClick={isOnline ? onSyncCloud : onOpenSyncQueue}
                disabled={isSyncing}
                title="Synchronize Local Database with Cloud"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden lg:inline">
                  {isSyncing ? 'Syncing...' : offlineCount > 0 ? `${offlineCount} Queued` : 'Cloud Synced'}
                </span>
              </button>
            </div>

            {/* Naira Wallet Balance Pill */}
            <div
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:to-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 cursor-pointer transition shadow-xs group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                ₦
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-medium leading-none">Naira Wallet</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition font-mono">
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeposit();
                }}
                title="Fund Naira Wallet"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md text-xs shadow-xs transition ml-1"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* User Dashboard / Auth Trigger */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Account & Auth</span>
              </button>
            )}

            {/* Schedule Post Quick Action */}
            <button
              onClick={onOpenComposer}
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>

            {/* Global Theme Toggle (Light / Dark Mode for late-night social management) */}
            <button
              onClick={toggleTheme}
              type="button"
              id="theme-toggle-btn"
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode for late-night social management'}
              title={
                isDark
                  ? 'Switch to Day Mode'
                  : 'Switch to Dark Mode (Late-Night Social Management)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-inner'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-200">Night</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-700">Day</span>
                </>
              )}
              {/* Toggle switch track & thumb */}
              <span
                className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-150 ${
                  isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
                />
                <span className="text-xs font-semibold text-slate-800 hidden md:block max-w-[90px] truncate">
                  {profile.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{profile.name}</p>
                    <p className="text-slate-500 truncate">{profile.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {profile.role}
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-medium">
                        <ShieldCheck className="w-3 h-3" /> Passkey Protected
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Admin Dashboard Entry */}
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-cyan-50 flex items-center justify-between text-cyan-800 font-bold border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-600" />
                        <span>Admin Control Desk</span>
                      </div>
                      {pendingFundingCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                          {pendingFundingCount}
                        </span>
                      )}
                    </button>

                    {onOpenAuthModal && (
                      <button
                        onClick={() => {
                          onOpenAuthModal();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2 text-indigo-700 font-semibold border-b border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        User Dashboard / Sign In & Register
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('security');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Security & Authentication Protocols
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('wallet');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      Full Wallet & Transaction Ledger
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('storage');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Cloud className="w-4 h-4 text-blue-600" />
                      Cloud Database & Media Backup
                    </button>

                    {/* Quick Theme Switcher in Profile Menu */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 border-t border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        {isDark ? (
                          <Sun className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-600" />
                        )}
                        <span>{isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {isDark ? 'Night Active' : 'Day Active'}
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-500" />
                        Sign Out / Switch User
                      </button>
                    )}
                    <button
                      onClick={() => {
                        storage.resetToDefaults();
                        window.location.reload();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Demo Database to Initial
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-2 border-t border-slate-100 text-xs sm:text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isAdmin = item.id === 'admin';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isAdmin
                    ? isActive
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'bg-cyan-50/80 hover:bg-cyan-100 text-cyan-800 font-semibold border border-cyan-200/80'
                    : isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />}
                <span>{item.label}</span>
                {isAdmin && pendingFundingCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {pendingFundingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toast Notification when offline toggle changed */}
      {showSimulatePrompt && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Back Online! Cloud database listener re-enabled.</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>Offline simulated: local state & queue are fully operational without internet!</span>
            </>
          )}
        </div>
      )}
    </header>
  );
};
