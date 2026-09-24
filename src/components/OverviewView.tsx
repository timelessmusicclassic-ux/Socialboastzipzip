import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Wallet,
  CloudCheck,
  Plus,
  ArrowUpRight,
  Send,
  Zap,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import {
  ADMIN_WALLET_ACCOUNT,
  ScheduledPost,
  ConnectedAccount,
  SMMOrder,
  UserProfile,
  WalletTransaction
} from '../types';
import { QuickTipsCard } from './QuickTipsCard';
import { FollowerGrowthD3Chart } from './FollowerGrowthD3Chart';

interface OverviewViewProps {
  posts: ScheduledPost[];
  accounts: ConnectedAccount[];
  orders: SMMOrder[];
  walletBalance: number;
  transactions?: WalletTransaction[];
  profile: UserProfile;
  onOpenComposer: () => void;
  onOpenDeposit: () => void;
  onNavigateTab: (tab: string) => void;
  onPublishNow: (post: ScheduledPost) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  posts,
  accounts,
  orders,
  walletBalance,
  transactions = [],
  profile,
  onOpenComposer,
  onOpenDeposit,
  onNavigateTab,
  onPublishNow
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const totalFollowers = accounts.reduce((acc, curr) => acc + curr.followers, 0);
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const nextScheduledPost = posts.find(p => p.status === 'scheduled');
  const recentOrders = orders.slice(0, 3);

  const pendingDeposits = transactions.filter(
    t => t.type === 'deposit' && t.status === 'pending'
  );

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ADMIN_WALLET_ACCOUNT.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <span className="text-pink-600 font-bold">IG</span>;
      case 'tiktok':
        return <span className="text-cyan-600 font-bold">TT</span>;
      case 'twitter':
        return <span className="text-blue-500 font-bold">X</span>;
      case 'youtube':
        return <span className="text-red-600 font-bold">YT</span>;
      case 'linkedin':
        return <span className="text-blue-700 font-bold">LI</span>;
      default:
        return <span className="text-slate-600 font-bold">SOC</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Fast Composer CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Really Simple Social Cloud Engine
              </span>
              <span className="text-xs text-slate-400">v2.4 Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {profile.name}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your multi-channel social engine is active. Automated post queues, SMM growth boosts, and offline-synchronized database storage are all healthy and synchronized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenComposer}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Post</span>
            </button>
            <button
              onClick={() => onNavigateTab('smm')}
              className="bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur-sm flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Boost Channels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Highlights Responsive Grid: Wallet Balance & Quick Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Highlighted Wallet Balance Card */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-300 transition relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition" />
          
          <div className="space-y-4 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-100 shadow-xs">
                  ₦
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Naira Wallet Balance
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Active Purchasing Power
                  </span>
                </div>
              </div>

              {pendingDeposits.length > 0 ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{pendingDeposits.length} Pending</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>OTP Verified</span>
                </span>
              )}
            </div>

            {/* Prominent Balance Display */}
            <div className="pt-1 pb-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                <span className="text-2xl text-emerald-600 font-sans">₦</span>
                <span>{walletBalance.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Ready for instant SMM boosts & channel campaigns</span>
              </p>
            </div>

            {/* Pending Deposit Alert Banner (if any) */}
            {pendingDeposits.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold block">
                    ₦{pendingDeposits[0].amount.toLocaleString()} Deposit Submitted
                  </span>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Awaiting admin confirmation. Balance updates immediately upon approval.
                  </p>
                </div>
              </div>
            )}

            {/* Official Kuda Bank Account Box with Copy Button */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" /> Admin Funding Account
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {ADMIN_WALLET_ACCOUNT.bankType} Bank
                </span>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Account Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                    {ADMIN_WALLET_ACCOUNT.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 active:scale-95"
                  title="Copy account number"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                <span>Account Name: <strong className="text-slate-800">{ADMIN_WALLET_ACCOUNT.assistanceBankingName}</strong></span>
                <span className="text-slate-400">• {ADMIN_WALLET_ACCOUNT.walletType}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-2 relative z-10">
            <button
              onClick={onOpenDeposit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Fund Naira Wallet</span>
            </button>
            <button
              onClick={() => onNavigateTab('wallet')}
              className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              <span>View Ledger</span>
            </button>
          </div>
        </div>

        {/* Highlighted Quick Tips Card */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <QuickTipsCard
            accounts={accounts}
            posts={posts}
            orders={orders}
            onOpenComposer={onOpenComposer}
            onNavigateTab={onNavigateTab}
            className="h-full flex flex-col justify-between"
          />
        </div>
      </div>

      {/* Secondary Performance & Cloud Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Audience */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Audience
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% monthly growth</span>
            </div>
          </div>
        </div>

        {/* Scheduled Queue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scheduled Posts
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {scheduledCount} Posts
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {nextScheduledPost
                  ? `Next in ${Math.max(1, Math.round((new Date(nextScheduledPost.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60)))}h`
                  : 'Queue idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Active SMM Growth Campaigns */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Growth Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {orders.length} Active
              </div>
              <span className="text-xs text-slate-500">SMM Boost Delivery</span>
            </div>
            <button
              onClick={() => onNavigateTab('smm')}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded"
            >
              + Boost
            </button>
          </div>
        </div>

        {/* Cloud & Protocol Health */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cloud & Security
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Encrypted & Passkey Active</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Offline sync replay enabled
            </div>
          </div>
        </div>
      </div>

      {/* D3-Based 30-Day Follower Growth Trend Chart */}
      <FollowerGrowthD3Chart accounts={accounts} />

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Posts & Quick Composer preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Scheduled Posts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Next in Queue</h3>
                <p className="text-xs text-slate-500">Automated multi-platform scheduling queue</p>
              </div>
              <button
                onClick={() => onNavigateTab('scheduler')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {posts.filter(p => p.status === 'scheduled').slice(0, 3).map(post => (
                <div key={post.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {post.mediaUrls.length > 0 ? (
                      <img
                        src={post.mediaUrls[0]}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Send className="w-5 h-5" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.platforms.map(p => (
                          <span
                            key={p}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase"
                          >
                            {p}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(post.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!post.syncedToCloud && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            Offline Stored
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onPublishNow(post)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Publish Now</span>
                    </button>
                  </div>
                </div>
              ))}

              {posts.filter(p => p.status === 'scheduled').length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm">No scheduled posts in the queue.</p>
                  <button
                    onClick={onOpenComposer}
                    className="mt-3 text-xs text-indigo-600 font-semibold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule your first post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connected Channels & Follower Velocity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Connected Social Profiles</h3>
                <p className="text-xs text-slate-500">Live API and webhook syncing across channels</p>
              </div>
              <button
                onClick={() => onNavigateTab('security')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage Connections
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={acc.avatarUrl}
                        alt={acc.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {acc.platform.toUpperCase()}
                      </span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${acc.connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs text-slate-500 truncate">{acc.username}</p>
                    <p className="text-sm font-bold text-slate-900">{acc.followers.toLocaleString()}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      +{acc.growthRate}% growth
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SMM Panel Snapshot & Fast Boosts */}
        <div className="space-y-6">
          {/* Really Simple Social - Growth Panel Quick Orders */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Growth Orders</h3>
                  <p className="text-[11px] text-slate-500">reallysimplesocial.com SMM Panel</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('smm')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Panel
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {recentOrders.map(order => (
                <div key={order.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
                      {order.serviceName}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      order.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Qty: {order.quantity.toLocaleString()}</span>
                    <span>Cost: ₦{order.cost.toLocaleString()}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{
                        width: order.status === 'Completed' ? '100%' : `${Math.round(((order.quantity - order.remains) / order.quantity) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('smm')}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg transition"
            >
              Start New Growth Campaign
            </button>
          </div>

          {/* Quick Shortcuts & Storage Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CloudCheck className="w-4 h-4 text-indigo-600" />
              Offline & Cloud Data Sync
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every post draft, schedule, and wallet transaction created offline is cached in local IndexedDB storage and synced automatically.
            </p>
            <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs">
              <span className="text-slate-600">Local Cache: 14.2 MB</span>
              <button
                onClick={() => onNavigateTab('storage')}
                className="text-indigo-700 font-semibold hover:underline"
              >
                Media & Backup →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
