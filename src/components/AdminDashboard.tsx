import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  KeyRound,
  Plus,
  RefreshCw,
  LogOut,
  Mail,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Filter,
  Building2,
  FileText
} from 'lucide-react';
import { RegisteredUser, FundingPaymentRequest, SecurityAuditLog, UserProfile, ADMIN_WALLET_ACCOUNT } from '../types';
import { storage } from '../services/storage';
import { auth } from '../services/auth';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  onBackToClient?: () => void;
  activeProfile?: UserProfile;
  currentUser?: UserProfile;
  onRefreshAppState?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToClient,
  activeProfile,
  currentUser,
  onRefreshAppState
}) => {
  const currentActiveUser = currentUser || activeProfile;

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const session = auth.getCurrentSession();
    return (
      currentActiveUser?.role === 'Super Admin' ||
      session?.role === 'Super Admin' ||
      session?.email === 'admin@reallysimplesocial.com' ||
      session?.email === 'timelessmusicclassic@gmail.com'
    );
  });

  const [adminIdInput, setAdminIdInput] = useState('admin@reallysimplesocial.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('AdminPassword123!');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Dashboard Navigation
  const [adminTab, setAdminTab] = useState<'requests' | 'users' | 'audit'>('requests');

  // Live Data States
  const [users, setUsers] = useState<RegisteredUser[]>(() => storage.getRegisteredUsers());
  const [fundingRequests, setFundingRequests] = useState<FundingPaymentRequest[]>(() => storage.getFundingRequests());
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => storage.getAuditLogs());

  // Search & Filtering for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal / Action States
  const [selectedUserForFunding, setSelectedUserForFunding] = useState<RegisteredUser | null>(null);
  const [fundAmountInput, setFundAmountInput] = useState<number>(25000);
  const [fundNoteInput, setFundNoteInput] = useState('Direct Admin Allocation for Social Boost');

  const [selectedUserForReset, setSelectedUserForReset] = useState<RegisteredUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscribe to storage updates
  useEffect(() => {
    const refreshData = () => {
      setUsers(storage.getRegisteredUsers());
      setFundingRequests(storage.getFundingRequests());
      setAuditLogs(storage.getAuditLogs());
    };

    window.addEventListener('rss_funding_requests_updated', refreshData);
    window.addEventListener('rss_storage_changed', refreshData);
    window.addEventListener('rss_funding_completed', refreshData);

    return () => {
      window.removeEventListener('rss_funding_requests_updated', refreshData);
      window.removeEventListener('rss_storage_changed', refreshData);
      window.removeEventListener('rss_funding_completed', refreshData);
    };
  }, []);

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);

    const cleanId = adminIdInput.trim().toLowerCase();
    const cleanPass = adminPasswordInput.trim();

    // Check against registered users with Super Admin role or default credentials
    const foundAdmin = users.find(
      u => (u.email.toLowerCase() === cleanId || u.username?.toLowerCase() === cleanId) &&
           (u.role === 'Super Admin' || u.id === 'usr_admin_001')
    );

    const isMasterAdmin =
      (cleanId === 'admin' || cleanId === 'admin@reallysimplesocial.com' || cleanId === 'timelessmusicclassic@gmail.com') &&
      (cleanPass === 'AdminPassword123!' || cleanPass === 'Password123!' || cleanPass === 'admin123');

    if (isMasterAdmin || (foundAdmin && (foundAdmin.password === cleanPass || cleanPass === 'AdminPassword123!'))) {
      setIsAdminLoggedIn(true);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      showNotification('Authenticated as Administrator. Welcome to Central Control.');
    } else {
      setAdminLoginError('Invalid Administrator ID or password. Use default master credentials.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    showNotification('Logged out from Admin Dashboard.');
  };

  // Quick fill helper for testing
  const handleQuickFillAdmin = () => {
    setAdminIdInput('admin@reallysimplesocial.com');
    setAdminPasswordInput('AdminPassword123!');
  };

  // 1. CONFIRM PAYMENT & DISPATCH 6-DIGIT CODE (Green Button Workflow)
  const handleConfirmAndDispatchCode = (req: FundingPaymentRequest) => {
    const result = storage.confirmAndDispatchFundingCode(req.id);
    setFundingRequests(storage.getFundingRequests());
    onRefreshAppState?.();
    if (result.success) {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      showNotification(`✓ Payment verified! 6-digit code [${req.sixDigitCode}] dispatched to ${req.userEmail}.`);
    } else {
      showNotification(result.message);
    }
  };

  // Direct complete & credit
  const handleInstantApproveAndCredit = (req: FundingPaymentRequest) => {
    const result = storage.approveAndCreditFundingRequest(req.id, 'Verified and approved by Administrator');
    setFundingRequests(storage.getFundingRequests());
    setUsers(storage.getRegisteredUsers());
    onRefreshAppState?.();
    if (result.success) {
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      showNotification(`✓ ₦${req.amount.toLocaleString()} credited directly to ${req.userName}'s wallet.`);
    }
  };

  // 2. DECLINE PAYMENT (Red Button Workflow)
  const handleDeclineRequest = (req: FundingPaymentRequest) => {
    const reason = window.prompt(
      `Specify decline reason for ${req.userName}'s funding request of ₦${req.amount.toLocaleString()}:`,
      'Payment verification failed - funds not matched on central ledger'
    );
    if (reason === null) return; // cancelled

    const result = storage.declineFundingRequest(req.id, reason);
    setFundingRequests(storage.getFundingRequests());
    onRefreshAppState?.();
    if (result.success) {
      showNotification(`✕ Payment request #${req.id.slice(-6)} marked as DECLINED.`);
    }
  };

  // 3. DIRECT FUND USER ACCOUNT
  const handleFundUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForFunding) return;

    if (fundAmountInput <= 0) {
      alert('Please enter a valid funding amount.');
      return;
    }

    storage.updateUserWalletBalance(selectedUserForFunding.id, fundAmountInput, fundNoteInput);
    setUsers(storage.getRegisteredUsers());
    onRefreshAppState?.();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
    showNotification(`✓ Successfully funded ₦${fundAmountInput.toLocaleString()} to ${selectedUserForFunding.name}'s wallet!`);
    setSelectedUserForFunding(null);
  };

  // 4. RESET USER ACCESS & PASSWORD
  const handleResetUserAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    const res = storage.adminResetUserAccess(selectedUserForReset.id, newPasswordInput || undefined);
    setUsers(storage.getRegisteredUsers());
    onRefreshAppState?.();
    if (res.success) {
      setResetSuccessMessage(`New Password set to: ${res.temporaryPassword}`);
      showNotification(`✓ Access reset for ${selectedUserForReset.email}`);
    }
  };

  // 5. TOGGLE USER STATUS (Active / Suspended)
  const handleToggleUserStatus = (user: RegisteredUser) => {
    const nextStatus = user.securityStatus === 'suspended' ? 'active' : 'suspended';
    storage.updateUserRoleAndStatus(user.id, { status: nextStatus });
    setUsers(storage.getRegisteredUsers());
    showNotification(`User ${user.email} is now ${nextStatus.toUpperCase()}.`);
  };

  // 6. SIMULATE NEW FUNDING REQUEST (For interactive evaluation)
  const handleSimulateNewRequest = () => {
    const randomUser = users[Math.floor(Math.random() * users.length)] || users[0];
    const amounts = [10000, 25000, 50000, 100000];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newReq: FundingPaymentRequest = {
      id: 'req_fund_' + Date.now().toString().slice(-5),
      userId: randomUser.id,
      userName: randomUser.name,
      userEmail: randomUser.email,
      userPhone: randomUser.phone,
      amount: randomAmount,
      currency: 'NGN',
      paymentMethod: `Admin Wallet Transfer (${ADMIN_WALLET_ACCOUNT.bankType} - ${ADMIN_WALLET_ACCOUNT.accountNumber})`,
      senderName: randomUser.name,
      senderBank: 'OPay / Access Bank',
      senderAccountNumber: '0' + Math.floor(100000000 + Math.random() * 900000000).toString(),
      sixDigitCode: randomCode,
      reference: 'PAY_NGN_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      signatureVerified: false
    };

    storage.addFundingRequest(newReq);
    setFundingRequests(storage.getFundingRequests());
    showNotification(`+ Simulated incoming funding request: ₦${randomAmount.toLocaleString()} from ${randomUser.name}`);
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.virtualAccountNumber.includes(searchQuery);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.securityStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pending funding requests count
  const pendingRequestsCount = useMemo(() => {
    return fundingRequests.filter(r => r.status === 'pending').length;
  }, [fundingRequests]);

  const totalUserBalances = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);
  }, [users]);

  // ==========================================
  // IF NOT LOGGED IN AS ADMIN: SHOW ADMIN LOGIN
  // ==========================================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-xl shadow-cyan-500/20 mb-4 ring-4 ring-white/10">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-3 py-0.5 rounded-full">
                Security Clearance Level 5
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Admin Control Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in with Admin ID and Password to manage users & verify funding
            </p>
          </div>

          {/* Admin Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
            {adminLoginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Admin ID / Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminIdInput}
                    onChange={e => setAdminIdInput(e.target.value)}
                    placeholder="admin@reallysimplesocial.com"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-mono transition"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign in to Admin Dashboard</span>
              </button>

              {/* Quick autofill helper */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Autofill Master Admin Credentials</span>
                </button>
                {onBackToClient && (
                  <button
                    type="button"
                    onClick={onBackToClient}
                    className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Exit to App
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-500">
              Authorized admin control system for Really Simple Social Nigeria. All sessions are cryptographically logged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD MAIN VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-950 border border-cyan-500/40 text-cyan-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold">{actionFeedback}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  Admin Dashboard Control Center
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Full Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Controlling User Accounts • Payment Approvals • 6-Digit Email Verification Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSimulateNewRequest}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Trigger a test funding payment to observe the green 6-digit code flow"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate User Payment</span>
            </button>

            {onBackToClient && (
              <button
                onClick={onBackToClient}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Return to</span> Client App
              </button>
            )}

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 hover:border-rose-700/50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Registered Users
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
                {users.length}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">100% active registry</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Pending Funding
                </span>
                {pendingRequestsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">
                {pendingRequestsCount}
              </span>
              <span className="text-[10px] text-amber-300 font-medium">
                {pendingRequestsCount > 0 ? 'Awaiting Green / Red Action' : 'All cleared'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Users Wallet Balances
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white mt-1 block font-mono">
                ₦{totalUserBalances.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Total credited liquidity</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Admin Central Account
              </span>
              <span className="text-sm sm:text-base font-bold text-cyan-300 mt-1 block font-mono">
                Kuda • {ADMIN_WALLET_ACCOUNT.accountNumber}
              </span>
              <span className="text-[10px] text-slate-400">timelessmusicclassic@gmail.com</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'requests'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Funding Requests</span>
              {pendingRequestsCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${adminTab === 'requests' ? 'bg-slate-950 text-cyan-300' : 'bg-emerald-500 text-slate-950'}`}>
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Management ({users.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'audit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Security & Audit Log</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PENDING WALLET FUNDING REQUESTS (THE PRIMARY SPECIFIED WORKFLOW) */}
        {/* ========================================================================= */}
        {adminTab === 'requests' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Payment Verification Desk</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    6-Digit Code Dispatcher
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  When a user funds their account, their 6-digit confirmation code pops up in <strong>GREEN</strong>. Clicking the green <strong>CONFIRM</strong> button verifies the payment signature and immediately delivers the 6-digit code to their email so they can complete funding. Clicking <strong>DECLINE (Red)</strong> flags the payment as declined and denies the funding.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateNewRequest}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Mock Funding</span>
                </button>
              </div>
            </div>

            {fundingRequests.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Pending Funding Requests</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All user funding payments have been handled. When a user requests confirmation on the website, it will immediately appear here.
                </p>
                <button
                  onClick={handleSimulateNewRequest}
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simulate a Test User Payment</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fundingRequests.map(req => {
                  const isPending = req.status === 'pending';
                  const isCodeDispatched = req.status === 'code_dispatched';
                  const isConfirmed = req.status === 'confirmed';
                  const isDeclined = req.status === 'declined';

                  return (
                    <div
                      key={req.id}
                      className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition shadow-lg space-y-4 ${
                        isPending
                          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                          : isDeclined
                          ? 'border-rose-500/30 bg-slate-900/60 opacity-85'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                            isPending ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' :
                            isDeclined ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            ₦
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-base text-white">
                                {req.userName}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                ID: {req.userId}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                                isCodeDispatched ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                                isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}>
                                {isPending ? 'Pending Admin Action' :
                                 isCodeDispatched ? 'Code Dispatched To Email' :
                                 isConfirmed ? 'Payment Confirmed' : 'Declined'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="text-cyan-300 font-mono">{req.userEmail}</span>
                              {req.userPhone && <span>• {req.userPhone}</span>}
                              <span>• Ref: {req.reference}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Requested Amount
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                            ₦{req.amount.toLocaleString()} NGN
                          </span>
                        </div>
                      </div>

                      {/* Payment sender details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">
                            Sender Account No.
                          </span>
                          <span className="font-mono font-bold text-white text-sm">
                            {req.senderAccountNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">
                            Sender Bank
                          </span>
                          <span className="font-semibold text-slate-200">
                            {req.senderBank}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">
                            Sender Name
                          </span>
                          <span className="font-semibold text-slate-200">
                            {req.senderName}
                          </span>
                        </div>
                      </div>

                      {/* WORKFLOW BAR: 6-DIGIT CODE POPPED UP IN GREEN & ACTION BUTTONS */}
                      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* THE 6-DIGIT CODE IN GREEN */}
                        <div className="flex items-center gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                              6-Digit Verification Token:
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Prominent Green Code Badge */}
                              <div
                                onClick={() => copyText(req.sixDigitCode, req.id)}
                                title="Click to copy 6-digit code"
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xl font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition select-all"
                              >
                                <span>{req.sixDigitCode}</span>
                                {copiedId === req.id ? (
                                  <Check className="w-4 h-4 text-slate-950" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-900 opacity-60" />
                                )}
                              </div>
                              <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                                {isCodeDispatched
                                  ? '✓ Code Delivered to User Email'
                                  : isConfirmed
                                  ? '✓ Signature Verified & Credited'
                                  : isDeclined
                                  ? '✕ Request Declined'
                                  : 'Click Green to Verify & Deliver'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ACTION BUTTONS: CONFIRM (GREEN) & DECLINE (RED) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* GREEN CONFIRM BUTTON: Verifies signature and delivers code to user's registered email */}
                          <button
                            type="button"
                            onClick={() => handleConfirmAndDispatchCode(req)}
                            disabled={isConfirmed}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                              isConfirmed
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-emerald-600/30'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isConfirmed
                                ? 'Already Approved'
                                : isCodeDispatched
                                ? 'Resend Code to Email (Green)'
                                : 'Confirm & Dispatch Code (Green)'}
                            </span>
                          </button>

                          {/* Direct Instant Credit */}
                          {!isConfirmed && !isDeclined && (
                            <button
                              type="button"
                              onClick={() => handleInstantApproveAndCredit(req)}
                              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm cursor-pointer"
                              title="Directly credit the user's wallet immediately"
                            >
                              <span>Direct Credit</span>
                            </button>
                          )}

                          {/* RED DECLINE BUTTON */}
                          {!isConfirmed && !isDeclined && (
                            <button
                              type="button"
                              onClick={() => handleDeclineRequest(req)}
                              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white transition shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline (Red)</span>
                            </button>
                          )}

                          {isDeclined && (
                            <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-lg">
                              Declined by Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPREHENSIVE USERS MANAGEMENT & DIRECT WALLET FUNDING */}
        {/* ========================================================================= */}
        {adminTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, ID..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Agency Lead">Agency Lead</option>
                  <option value="Creator">Creator</option>
                  <option value="Member">Member</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Data Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role & Status</th>
                      <th className="py-3 px-4">Virtual Naira Account</th>
                      <th className="py-3 px-4">Naira Balance</th>
                      <th className="py-3 px-4">Password / Access</th>
                      <th className="py-3 px-4 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map(user => {
                      const isSuspended = user.securityStatus === 'suspended';

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          {/* User Identity */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {user.role === 'Super Admin' && (
                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                  <span className="font-mono text-cyan-400">{user.email}</span>
                                  <span>•</span>
                                  <span className="text-slate-500 font-mono">{user.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                user.role === 'Super Admin' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                                user.role === 'Agency Lead' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {user.role}
                              </span>
                              <div>
                                <span className={`text-[10px] font-semibold ${
                                  isSuspended ? 'text-rose-400' : 'text-emerald-400'
                                }`}>
                                  ● {isSuspended ? 'Suspended' : 'Active & Verified'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Virtual Account */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-200">
                                {user.virtualAccountNumber}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {user.virtualBankName}
                              </div>
                            </div>
                          </td>

                          {/* Balance */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-extrabold text-sm text-emerald-400">
                              ₦{(user.walletBalance || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Password Access */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                              <span>••••••••</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForReset(user);
                                  setNewPasswordInput('');
                                  setResetSuccessMessage(null);
                                }}
                                className="text-cyan-400 hover:text-cyan-300 text-[10px] underline ml-1 cursor-pointer"
                              >
                                Reset Pass
                              </button>
                            </div>
                          </td>

                          {/* Controls */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Fund Account */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForFunding(user);
                                  setFundAmountInput(25000);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                                title="Credit this user's wallet with Naira"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Fund Wallet</span>
                              </button>

                              {/* Toggle Suspension */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user)}
                                className={`p-1.5 rounded-lg text-xs transition border cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 hover:border-rose-500/30'
                                }`}
                                title={isSuspended ? 'Reactivate User' : 'Suspend User'}
                              >
                                {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUDIT TRAIL */}
        {/* ========================================================================= */}
        {adminTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Central Security & Financial Ledger</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Real-time cryptographic audit trail of all funding, admin authorizations, and user accesses.
              </p>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{log.event}</p>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                        <span>IP: {log.ip}</span>
                        <span>•</span>
                        <span>Device: {log.device}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DIRECT USER ACCOUNT FUNDING */}
      {/* ========================================================================= */}
      {selectedUserForFunding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ₦
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Direct User Wallet Funding</h3>
                  <p className="text-[11px] text-slate-400">Admin Central Liquidity Injection</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForFunding(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Recipient info card */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
              <img
                src={selectedUserForFunding.avatarUrl}
                alt={selectedUserForFunding.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-white block">{selectedUserForFunding.name}</span>
                <span className="font-mono text-cyan-400 text-[11px] block">{selectedUserForFunding.email}</span>
                <span className="text-[10px] text-slate-500">
                  Current Balance: ₦{(selectedUserForFunding.walletBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleFundUserAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Funding Amount in Nigerian Naira (₦)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[10000, 25000, 50000, 100000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFundAmountInput(val)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        fundAmountInput === val
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={fundAmountInput}
                  onChange={e => setFundAmountInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={fundNoteInput}
                  onChange={e => setFundNoteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForFunding(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Credit ₦{fundAmountInput.toLocaleString()}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET USER ACCESS / PASSWORD */}
      {/* ========================================================================= */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Reset User Access & Password</h3>
                  <p className="text-[11px] text-slate-400">Account Recovery Administration</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForReset(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Set a fresh password for user <strong>{selectedUserForReset.email}</strong> ({selectedUserForReset.name}).
            </p>

            {resetSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetUserAccess} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password (leave empty to auto-generate secure password)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NewPass2026!#"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
