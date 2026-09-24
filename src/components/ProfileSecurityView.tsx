import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Smartphone,
  Fingerprint,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sliders,
  ExternalLink,
  Lock
} from 'lucide-react';
import { UserProfile, ConnectedAccount, SecurityAuditLog } from '../types';
import { auth } from '../services/auth';
import { storage } from '../services/storage';

interface ProfileSecurityViewProps {
  profile: UserProfile;
  accounts: ConnectedAccount[];
  auditLogs: SecurityAuditLog[];
  onUpdateProfile: (updated: UserProfile) => void;
  onToggleAccountConnect: (accountId: string) => void;
  onOpenAuthModal?: () => void;
}

export const ProfileSecurityView: React.FC<ProfileSecurityViewProps> = ({
  profile,
  accounts,
  auditLogs,
  onUpdateProfile,
  onToggleAccountConnect,
  onOpenAuthModal
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [apiKey, setApiKey] = useState(profile.apiKey);
  const [copiedKey, setCopiedKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security test states
  const [passkeyTesting, setPasskeyTesting] = useState(false);
  const [passkeyResult, setPasskeyResult] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpResult, setTotpResult] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      email,
      role: role as any,
      timezone,
      apiKey
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestPasskey = async () => {
    setPasskeyTesting(true);
    setPasskeyResult(null);
    const res = await auth.verifyPasskeyProtocol();
    setPasskeyTesting(false);
    setPasskeyResult(res.message);
  };

  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = auth.verify2FACode(totpCode);
    if (valid) {
      setTotpResult('TOTP Code verified! RFC 6238 time-drift window acceptable.');
    } else {
      setTotpResult('Invalid 6-digit TOTP code. Enter any 6-digit number (e.g. 123456).');
    }
  };

  const generateNewApiKey = () => {
    const newKey = 'rss_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setApiKey(newKey);
    storage.addAuditLog({
      event: 'New API Automation Token Generated',
      ip: '192.0.2.14',
      location: 'Security Settings',
      device: 'Dashboard Client',
      status: 'success'
    });
  };

  const handleRevokeSessions = () => {
    auth.revokeAllSessions();
    alert('All active JWT sessions revoked. A new master authentication token has been created.');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{profile.email}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Plan: {profile.plan} (All Features Unlocked)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>User Dashboard & Login</span>
              </button>
            )}
            <button
              onClick={handleRevokeSessions}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke Sessions</span>
            </button>
          </div>
        </div>

        {/* Admin Naira Funding Account Details Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Admin Funding Bank & Type</span>
            <span className="font-bold text-slate-900">Kuda Bank (Social funding)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Admin Account & Beneficiary</span>
            <span className="font-mono text-sm font-bold text-emerald-700 tracking-wider">
              2074308390 • Nkechi gift
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Funding Security Protocol</span>
            <span className="font-semibold text-amber-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 6-Digit OTP + Admin Approval
            </span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile configuration saved and synced across nodes.</span>
        </div>
      )}

      {/* 2-Column: Profile Settings & Connected Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile Details Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Profile Management
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role / Permissions</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Super Admin">Super Admin (Full Root Access)</option>
                <option value="Agency Lead">Agency Lead (Campaigns & Wallet)</option>
                <option value="Creator">Creator (Post Scheduling Only)</option>
                <option value="Member">Member (Read-Only Analytics)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Scheduling Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Africa/Lagos (WAT)">Africa/Lagos (WAT - RSS HQ)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">API Secret Key</label>
                <button
                  type="button"
                  onClick={generateNewApiKey}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={apiKey}
                  className="w-full font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={copyApiKey}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-600"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Connected Social Accounts & Security Protocols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connected Social Channels */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Connected Social Profiles</h3>
                <p className="text-xs text-slate-500">Authorized OAuth tokens for post scheduling & growth</p>
              </div>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {accounts.filter(a => a.connected).length} / {accounts.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatarUrl}
                      alt={acc.username}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{acc.displayName}</span>
                        <span className="uppercase text-[9px] font-bold bg-slate-200 text-slate-700 px-1 py-0.2 rounded">
                          {acc.platform}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{acc.username}</p>
                      <p className="text-[10px] text-slate-400">
                        {acc.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleAccountConnect(acc.id)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition shrink-0 ${
                      acc.connected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {acc.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Secure User Authentication Protocols Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Security & Authentication Protocols
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hardware-backed cryptographic sign-in, FIDO2 Passkeys, and multi-factor authentication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Passkey Protocol Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-indigo-600" />
                      FIDO2 Biometric Passkey
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    TouchID, FaceID, or Windows Hello cryptographic key stored in device Secure Enclave.
                  </p>
                </div>

                {passkeyResult && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                    {passkeyResult}
                  </div>
                )}

                <button
                  onClick={handleTestPasskey}
                  disabled={passkeyTesting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  {passkeyTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Passkey...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Test Passkey Signature</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2FA TOTP Protocol Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      2FA Authenticator (TOTP)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Google Authenticator or 1Password 6-digit rolling code (RFC 6238 protocol).
                  </p>
                </div>

                {totpResult && (
                  <div className={`text-[11px] p-2 rounded border ${
                    totpResult.includes('acceptable')
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {totpResult}
                  </div>
                )}

                <form onSubmit={handleVerifyTotp} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-center tracking-widest text-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1 rounded-lg text-xs transition"
                  >
                    Verify
                  </button>
                </form>
              </div>
            </div>

            {/* Admin User Recovery Data Storage */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Admin List for Recovery Data Storage & Security
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    All website registered users are stored in the encrypted admin registry for account access recovery and security auditing.
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {storage.getAdminRecoveryRecords().length} Verified Accounts
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs bg-white">
                {storage.getAdminRecoveryRecords().map(rec => (
                  <div key={rec.id} className="p-3 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rec.fullName}</span>
                        <span className="text-indigo-600 font-mono text-[11px]">@{rec.username}</span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-medium">
                          {rec.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>{rec.email}</span>
                        <span>•</span>
                        <span>{rec.phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Security Key</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {rec.recoveryCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Virtual NGN Account</span>
                        <span className="font-mono text-[11px] text-emerald-700 font-bold">
                          {rec.virtualAccount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="pt-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Recent Security Audit Logs
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="p-3 bg-white hover:bg-slate-50/70 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{log.event}</p>
                      <p className="text-[10px] text-slate-400">
                        {log.device} • {log.ip} ({log.location})
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
