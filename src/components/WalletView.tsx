import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  Lock,
  Mail,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Filter,
  Calendar,
  Search,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { WalletTransaction, UserProfile, ADMIN_WALLET_ACCOUNT } from '../types';
import { storage } from '../services/storage';
import confetti from 'canvas-confetti';

interface WalletViewProps {
  walletBalance: number;
  transactions: WalletTransaction[];
  profile: UserProfile;
  onOpenDeposit: () => void;
  onOpenAuthModal?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  walletBalance,
  transactions,
  profile,
  onOpenDeposit,
  onOpenAuthModal
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAdminField, setCopiedAdminField] = useState<string | null>(null);
  const [copiedAllAdmin, setCopiedAllAdmin] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const hasActiveFilters =
    filterType !== 'all' ||
    dateRange !== 'all' ||
    searchQuery.trim() !== '' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const handleResetFilters = () => {
    setFilterType('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
  };

  const filteredTransactions = transactions.filter(t => {
    // 1. Transaction Type Filter
    if (filterType !== 'all') {
      if (filterType === 'pending') {
        if (t.status !== 'pending') return false;
      } else if (filterType === 'deposit') {
        if (t.type !== 'deposit') return false;
      } else if (filterType === 'smm_spending') {
        if (t.type !== 'smm_order' && t.type !== 'boost') return false;
      } else if (filterType === 'smm_order') {
        if (t.type !== 'smm_order') return false;
      } else if (filterType === 'boost') {
        if (t.type !== 'boost') return false;
      } else if (filterType === 'refund') {
        if (t.type !== 'refund') return false;
      } else if (t.type !== filterType) {
        return false;
      }
    }

    // 2. Date Range Filter
    if (dateRange !== 'all') {
      const txTime = new Date(t.date).getTime();
      if (!isNaN(txTime)) {
        const now = Date.now();
        if (dateRange === 'today') {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          if (txTime < todayStart.getTime()) return false;
        } else if (dateRange === 'yesterday') {
          const yStart = new Date();
          yStart.setDate(yStart.getDate() - 1);
          yStart.setHours(0, 0, 0, 0);
          const yEnd = new Date();
          yEnd.setDate(yEnd.getDate() - 1);
          yEnd.setHours(23, 59, 59, 999);
          if (txTime < yStart.getTime() || txTime > yEnd.getTime()) return false;
        } else if (dateRange === 'last_7_days') {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (txTime < sevenDaysAgo) return false;
        } else if (dateRange === 'last_30_days') {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (txTime < thirtyDaysAgo) return false;
        } else if (dateRange === 'last_90_days') {
          const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
          if (txTime < ninetyDaysAgo) return false;
        } else if (dateRange === 'this_year') {
          const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
          if (txTime < yearStart) return false;
        } else if (dateRange === 'custom') {
          if (customStartDate) {
            const start = new Date(customStartDate + 'T00:00:00').getTime();
            if (!isNaN(start) && txTime < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate + 'T23:59:59.999').getTime();
            if (!isNaN(end) && txTime > end) return false;
          }
        }
      }
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        t.description.toLowerCase().includes(q) ||
        t.referenceId.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        (t.senderName && t.senderName.toLowerCase().includes(q)) ||
        (t.senderBank && t.senderBank.toLowerCase().includes(q)) ||
        (t.senderAccountNumber && t.senderAccountNumber.includes(q)) ||
        (t.verificationToken && t.verificationToken.includes(q));
      if (!matches) return false;
    }

    return true;
  });

  const filteredDepositsTotal = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status !== 'failed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const filteredSpendingTotal = filteredTransactions
    .filter(t => (t.type === 'smm_order' || t.type === 'boost') && t.status !== 'failed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const copyAdminText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAdminField(fieldKey);
    setTimeout(() => setCopiedAdminField(null), 2000);
  };

  const copyAllAdminDetails = () => {
    const text = `Bank: ${ADMIN_WALLET_ACCOUNT.bankType}\nAccount Number: ${ADMIN_WALLET_ACCOUNT.accountNumber}\nAccount Name: ${ADMIN_WALLET_ACCOUNT.assistanceBankingName}\nWallet Type: ${ADMIN_WALLET_ACCOUNT.walletType}`;
    navigator.clipboard.writeText(text);
    setCopiedAllAdmin(true);
    setTimeout(() => setCopiedAllAdmin(false), 2500);
  };

  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Admin Approval actions
  const handleApproveTransaction = (txId: string) => {
    const tx = storage.approveTransaction(txId);
    if (tx) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
      setActionNotice(`Transaction #${txId} Approved! ₦${tx.amount.toLocaleString()} credited to wallet.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleApproveAllPending = () => {
    const count = storage.approveAllPendingTransactions();
    if (count > 0) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (err) {}
      setActionNotice(`Successfully approved all ${count} pending funding transactions!`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRejectTransaction = (txId: string) => {
    const tx = storage.rejectTransaction(txId);
    if (tx) {
      setActionNotice(`Funding transaction #${txId} was rejected.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Wallet Cards Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Naira Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[250px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" /> Naira Wallet
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  NGN Active
                </span>
                {pendingTransactions.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{pendingTransactions.length} Pending Approval</span>
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-mono">
                  ₦{walletBalance.toLocaleString()}.00
                </span>
                <span className="text-emerald-400 text-sm font-semibold font-mono">NGN</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Deposits authenticated via 6-digit email OTP & verified by Admin</span>
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[11px] text-slate-400 block">Active Account</span>
              <span className="text-xs font-bold text-white block">{profile.name}</span>
              <span className="text-[10px] text-indigo-300 font-mono block truncate max-w-[180px]">
                {profile.email}
              </span>
            </div>
          </div>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-800 text-xs mt-4">
            <div>
              <p className="text-slate-400 text-[11px]">Primary Currency</p>
              <p className="font-bold text-emerald-400 font-mono">Nigerian Naira (₦ NGN)</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Funding Security</p>
              <p className="font-bold text-slate-100 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>6-Digit Email Code</span>
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-slate-400 text-[11px]">Pending Approvals</p>
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingTransactions.length} Awaiting Admin</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={onOpenDeposit}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Fund Naira Wallet (Admin Transfer)</span>
            </button>
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-white/15 transition flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-indigo-300" />
                <span>Switch / Sign Up User</span>
              </button>
            )}
          </div>
        </div>

        {/* Official Admin Account Details Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Admin Funding Account Details</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Official Wallet
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Transfer funding directly to the Admin Kuda Social funding account below:
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Bank Type
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{ADMIN_WALLET_ACCOUNT.bankType}</span>
                <button
                  type="button"
                  onClick={() => copyAdminText(ADMIN_WALLET_ACCOUNT.bankType, 'bank')}
                  className="text-slate-500 hover:text-indigo-600 text-[11px] flex items-center gap-1 font-medium"
                >
                  {copiedAdminField === 'bank' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedAdminField === 'bank' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Account Number
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-emerald-700 tracking-wider">
                  {ADMIN_WALLET_ACCOUNT.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyAdminText(ADMIN_WALLET_ACCOUNT.accountNumber, 'acc')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  {copiedAdminField === 'acc' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Assistance Banking Name
              </span>
              <span className="font-bold text-slate-800 block">{ADMIN_WALLET_ACCOUNT.assistanceBankingName}</span>
            </div>

            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Wallet Type / Narration
              </span>
              <span className="font-bold text-indigo-700 block">{ADMIN_WALLET_ACCOUNT.walletType}</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={copyAllAdminDetails}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              {copiedAllAdmin ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">All Details Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Complete Admin Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Approval Console */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Admin Approval Console: Social Funding Review
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                {pendingTransactions.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Transfers to Kuda (2074308390 - Nkechi gift) verified by 6-digit email token. Click <strong>Approve</strong> to reflect the amount on the user's wallet balance.
            </p>
          </div>

          {pendingTransactions.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve All Pending ({pendingTransactions.length})</span>
            </button>
          )}
        </div>

        {pendingTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-800 text-sm">All funding transactions are up to date</p>
            <p>No deposits currently awaiting admin approval. New transfers verified with 6-digit tokens will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTransactions.map(tx => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      +₦{tx.amount.toLocaleString()}.00 NGN
                    </span>
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Admin Review</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ref: {tx.referenceId}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span>
                      Sender: <strong className="text-slate-800">{tx.senderName || profile.name}</strong>
                    </span>
                    {tx.senderAccountNumber && (
                      <span className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-mono font-semibold">
                        Acc No: <strong>{tx.senderAccountNumber}</strong>
                      </span>
                    )}
                    {tx.senderBank && (
                      <span>
                        Bank: <strong className="text-slate-800">{tx.senderBank}</strong>
                      </span>
                    )}
                    {tx.verificationToken && (
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        Token: {tx.verificationToken}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      Dispatched to: <span className="font-mono text-slate-600">timelessmusicclassic@gmail.com</span>
                    </span>
                    <span>
                      Destination: <strong className="text-emerald-700">Kuda 2074308390 (Nkechi gift)</strong>
                    </span>
                    <span>
                      Requested: {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRejectTransaction(tx.id)}
                    className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveTransaction(tx.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Credit ₦{tx.amount.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Ledger Header & Primary Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <span>Naira Transaction Ledger</span>
                </h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  NGN Currency
                </span>
                {pendingTransactions.length > 0 && (
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{pendingTransactions.length} Pending</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Filter and audit transaction history by type (Deposits vs. SMM Spending) and date range
              </p>
            </div>

            {/* Quick 1-Click Type Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'deposit', label: 'Deposits (+₦)' },
                { id: 'smm_spending', label: 'SMM Spending (-₦)' },
                { id: 'pending', label: `Pending (${pendingTransactions.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  id={`quick-filter-${tab.id}`}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap text-xs ${
                    filterType === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Dropdown Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Filter Dropdown: Transaction Type */}
            <div className="sm:col-span-4">
              <label
                htmlFor="wallet-filter-type-select"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"
              >
                <Filter className="w-3 h-3 text-indigo-500" />
                <span>Transaction Type</span>
              </label>
              <div className="relative">
                <select
                  id="wallet-filter-type-select"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 pr-8 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="all">All Transaction Types</option>
                  <option value="deposit">Deposits (Wallet Funding / Inflow)</option>
                  <option value="smm_spending">SMM Spending (All Orders & Boosts)</option>
                  <option value="smm_order">SMM Orders Only</option>
                  <option value="boost">Post Boosts & Promotions</option>
                  <option value="refund">Refunds & Reversals</option>
                  <option value="pending">Pending Admin Review</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Filter Dropdown: Date Range */}
            <div className="sm:col-span-4">
              <label
                htmlFor="wallet-filter-date-range-select"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"
              >
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>Date Range</span>
              </label>
              <div className="relative">
                <select
                  id="wallet-filter-date-range-select"
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 pr-8 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="all">All Time (Entire History)</option>
                  <option value="today">Today (Last 24 Hours)</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days (Past Month)</option>
                  <option value="last_90_days">Last 90 Days (Quarterly)</option>
                  <option value="this_year">This Year (2026)</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="sm:col-span-4">
              <label
                htmlFor="wallet-search-input"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-indigo-500" />
                <span>Search Records</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="wallet-search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Ref, sender, bank, token..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-8 pr-8 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Custom Date Range Picker (shown when dateRange === 'custom') */}
          {dateRange === 'custom' && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-wrap items-center gap-4 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Start Date:
                </span>
                <input
                  type="date"
                  id="wallet-custom-start-date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> End Date:
                </span>
                <input
                  type="date"
                  id="wallet-custom-end-date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Clear Custom Dates
                </button>
              )}
            </div>
          )}

          {/* Filter Status Strip & Live Financial Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Showing <strong className="text-indigo-600 dark:text-indigo-400">{filteredTransactions.length}</strong> of{' '}
                {transactions.length} records
              </span>

              {/* Filter Inflow Tag */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-medium">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Deposits: +₦{filteredDepositsTotal.toLocaleString()}</span>
              </span>

              {/* Filter Outflow Tag */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-medium">
                <TrendingDown className="w-3 h-3 text-rose-600" />
                <span>SMM Spending: -₦{filteredSpendingTotal.toLocaleString()}</span>
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                id="wallet-reset-filters-btn"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Transaction Records List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="py-14 px-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No transactions match your filter criteria
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Try adjusting your type filter (currently: <strong>{filterType}</strong>), date range (currently:{' '}
                  <strong>{dateRange}</strong>), or search keywords.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  id="wallet-empty-reset-btn"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const isDeposit = tx.type === 'deposit';
              const isPending = tx.status === 'pending';
              const isCompleted = tx.status === 'completed';
              const isFailed = tx.status === 'failed';
              const displayAmount = Math.abs(tx.amount);

              return (
                <div
                  key={tx.id}
                  className={`p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-4 text-xs ${
                    isPending ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPending
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                          : isDeposit
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isPending ? (
                        <Clock className="w-5 h-5" />
                      ) : isDeposit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] flex-wrap">
                        <span>
                          {new Date(tx.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{tx.paymentMethod}</span>
                        {tx.senderName && (
                          <>
                            <span>•</span>
                            <span>Sender: {tx.senderName}</span>
                          </>
                        )}
                        {tx.senderAccountNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-indigo-700 dark:text-indigo-300">Acc: {tx.senderAccountNumber}</span>
                          </>
                        )}
                        {tx.verificationToken && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-300">Token: {tx.verificationToken}</span>
                          </>
                        )}
                        <span>•</span>
                        <button
                          onClick={() => copyToClipboard(tx.referenceId, tx.id)}
                          className="font-mono text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ref: {tx.referenceId}</span>
                          {copiedTxId === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isPending
                          ? 'text-amber-600 dark:text-amber-400'
                          : isDeposit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isDeposit ? `+₦${displayAmount.toLocaleString()}` : `-₦${displayAmount.toLocaleString()}`} NGN
                    </span>
                    <div className="mt-0.5">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                          <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">
                          <XCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
