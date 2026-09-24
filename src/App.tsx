import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { PostSchedulerView } from './components/PostSchedulerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SMMStoreView } from './components/SMMStoreView';
import { WalletView } from './components/WalletView';
import { MediaStorageView } from './components/MediaStorageView';
import { ProfileSecurityView } from './components/ProfileSecurityView';
import { PostComposerModal } from './components/PostComposerModal';
import { DepositModal } from './components/DepositModal';
import { SyncStatusModal } from './components/SyncStatusModal';
import { UserAuthModal } from './components/UserAuthModal';
import { LandingAuthView } from './components/LandingAuthView';
import { AdminDashboard } from './components/AdminDashboard';
import { storage } from './services/storage';
import { auth } from './services/auth';
import {
  ScheduledPost,
  ConnectedAccount,
  SMMOrder,
  SMMService,
  WalletTransaction,
  MediaAsset,
  UserProfile,
  SecurityAuditLog,
  OfflineSyncItem
} from './types';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => auth.isAuthenticated());

  // Application Data States initialized from Storage
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [posts, setPosts] = useState<ScheduledPost[]>(storage.getPosts());
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(storage.getAccounts());
  const [orders, setOrders] = useState<SMMOrder[]>(storage.getOrders());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(storage.getWalletTransactions());
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(storage.getMediaAssets());
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(storage.getAuditLogs());
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>(storage.getOfflineQueue());
  const [walletBalance, setWalletBalance] = useState<number>(storage.getWalletBalance());
  const [lastSyncTime, setLastSyncTime] = useState<string>(storage.getLastSyncTime());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialDate, setComposerInitialDate] = useState<string | undefined>(undefined);
  const [composerInitialMedia, setComposerInitialMedia] = useState<string | undefined>(undefined);
  const [depositOpen, setDepositOpen] = useState(false);
  const [syncQueueOpen, setSyncQueueOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state refresh
  const refreshStateFromStorage = () => {
    setProfile(storage.getProfile());
    setPosts(storage.getPosts());
    setAccounts(storage.getAccounts());
    setOrders(storage.getOrders());
    setTransactions(storage.getWalletTransactions());
    setMediaAssets(storage.getMediaAssets());
    setAuditLogs(storage.getAuditLogs());
    setOfflineQueue(storage.getOfflineQueue());
    setWalletBalance(storage.getWalletBalance());
    setLastSyncTime(storage.getLastSyncTime());
  };

  useEffect(() => {
    const handleQueueChange = () => {
      setOfflineQueue(storage.getOfflineQueue());
    };
    const handleAuthChange = () => {
      setIsAuthenticated(auth.isAuthenticated());
      refreshStateFromStorage();
    };
    window.addEventListener('rss_queue_updated', handleQueueChange);
    window.addEventListener('rss_connectivity_change', handleQueueChange);
    window.addEventListener('rss_auth_state_changed', handleAuthChange);
    window.addEventListener('rss_storage_changed', handleAuthChange);

    return () => {
      window.removeEventListener('rss_queue_updated', handleQueueChange);
      window.removeEventListener('rss_connectivity_change', handleQueueChange);
      window.removeEventListener('rss_auth_state_changed', handleAuthChange);
      window.removeEventListener('rss_storage_changed', handleAuthChange);
    };
  }, []);

  // Post Actions
  const handleSavePost = (newPost: ScheduledPost) => {
    storage.addPost(newPost);
    refreshStateFromStorage();
    showToast(
      newPost.status === 'published'
        ? 'Post published immediately across targeted channels!'
        : 'Post scheduled successfully in automated queue!'
    );
  };

  const handlePublishNow = (post: ScheduledPost) => {
    const updated: ScheduledPost = {
      ...post,
      status: 'published',
      scheduledAt: new Date().toISOString()
    };
    storage.updatePost(updated);
    storage.addAuditLog({
      event: `Post #${post.id} Published Manually to [${post.platforms.join(', ')}]`,
      ip: '192.0.2.14',
      location: 'New York, USA',
      device: 'Post Scheduler',
      status: 'success'
    });
    refreshStateFromStorage();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    showToast(`Published to ${post.platforms.join(', ').toUpperCase()}!`);
  };

  const handleDeletePost = (postId: string) => {
    storage.deletePost(postId);
    refreshStateFromStorage();
    showToast('Post removed from schedule.');
  };

  const handleBoostPost = (post: ScheduledPost) => {
    setActiveTab('smm');
    showToast(`Configure boost for: ${post.content.slice(0, 30)}...`);
  };

  // SMM Order Action
  const handleSubmitSMMOrder = (orderData: {
    service: SMMService;
    targetLink: string;
    quantity: number;
    cost: number;
    targetRegion?: string;
    targetNiche?: string;
    deliverySpeed?: string;
    audienceQuality?: string;
  }): boolean => {
    if (walletBalance < orderData.cost) {
      showToast('Insufficient wallet balance. Please add funds first.');
      return false;
    }

    const orderId = 'ord_' + Math.random().toString(36).substr(2, 6);
    const newOrder: SMMOrder = {
      id: orderId,
      serviceId: orderData.service.id,
      serviceName: orderData.service.name,
      category: orderData.service.category,
      targetLink: orderData.targetLink,
      quantity: orderData.quantity,
      cost: orderData.cost,
      status: 'In Progress',
      startCount: Math.floor(Math.random() * 500) + 100,
      remains: orderData.quantity,
      createdAt: new Date().toISOString(),
      syncedToCloud: storage.isOnline(),
      targetRegion: orderData.targetRegion || 'Targeted West Africa & Global',
      targetNiche: orderData.targetNiche || 'All Audience Categories',
      deliverySpeed: orderData.deliverySpeed || 'Algorithmic Drip-Feed',
      audienceQuality: orderData.audienceQuality || '100% Genuine Engagers'
    };

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now().toString().slice(-6),
      type: 'smm_order',
      amount: -orderData.cost,
      currency: 'NGN',
      status: 'completed',
      date: new Date().toISOString(),
      description: `Targeted SMM Boost #${orderId} (${orderData.service.category} - ${newOrder.targetRegion})`,
      referenceId: orderId,
      paymentMethod: 'Internal Naira Balance'
    };

    storage.addOrder(newOrder);
    storage.addWalletTransaction(newTx);
    storage.addAuditLog({
      event: `Targeted SMM Boost #${orderId} queued: ${orderData.quantity.toLocaleString()} units (${orderData.service.category} • ${newOrder.targetRegion})`,
      ip: '192.0.2.14',
      location: 'Lagos, Nigeria',
      device: 'SMM Growth Engine Pro',
      status: 'success'
    });

    refreshStateFromStorage();
    return true;
  };

  // Wallet Action
  const handleAddDeposit = (tx: WalletTransaction) => {
    storage.addWalletTransaction(tx);
    storage.addAuditLog({
      event: `Social Funding Submitted: ₦${tx.amount.toLocaleString()} (Pending Admin Approval - Kuda 2074308390)`,
      ip: '192.0.2.14',
      location: 'New York, USA',
      device: 'Social Funding Portal',
      status: 'success'
    });
    refreshStateFromStorage();
    if (tx.status === 'pending') {
      showToast(`Funding transaction for ₦${tx.amount.toLocaleString()} submitted! Pending admin approval.`);
    } else {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
      showToast(`Successfully credited ₦${tx.amount.toLocaleString()} to your Naira wallet!`);
    }
  };

  // Media Actions
  const handleUploadAsset = (asset: MediaAsset) => {
    storage.addMediaAsset(asset);
    refreshStateFromStorage();
    showToast('Asset saved to cloud storage & cached locally.');
  };

  const handleUseAssetInPost = (assetUrl: string) => {
    setComposerInitialMedia(assetUrl);
    setComposerInitialDate(undefined);
    setComposerOpen(true);
  };

  const handleDeleteAsset = (assetId: string) => {
    const assets = mediaAssets.filter(a => a.id !== assetId);
    storage.saveMediaAssets(assets);
    refreshStateFromStorage();
    showToast('Asset removed.');
  };

  // Profile Actions
  const handleUpdateProfile = (updated: UserProfile) => {
    storage.saveProfile(updated);
    storage.addAuditLog({
      event: 'Profile Settings & Credentials Updated',
      ip: '192.0.2.14',
      location: 'New York, USA',
      device: 'Dashboard Settings',
      status: 'success'
    });
    refreshStateFromStorage();
    showToast('Profile and security protocols saved.');
  };

  const handleToggleAccountConnect = (accountId: string) => {
    const accs = accounts.map(a => {
      if (a.id === accountId) {
        return { ...a, connected: !a.connected };
      }
      return a;
    });
    storage.saveAccounts(accs);
    refreshStateFromStorage();
    const target = accs.find(a => a.id === accountId);
    showToast(`${target?.displayName} ${target?.connected ? 'connected' : 'disconnected'}.`);
  };

  // Cloud Sync Trigger
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    const result = await storage.syncCloudNow();
    setIsSyncing(false);
    refreshStateFromStorage();
    showToast(result.message);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <LandingAuthView
          onAuthSuccess={(session) => {
            setIsAuthenticated(true);
            refreshStateFromStorage();
            showToast(`Welcome, ${session.name}! Authenticated to your Nigeria SMM panel.`);
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* Top Navigation & Status Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenComposer={() => {
          setComposerInitialDate(undefined);
          setComposerInitialMedia(undefined);
          setComposerOpen(true);
        }}
        onOpenSyncQueue={() => setSyncQueueOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onSignOut={() => {
          auth.logout();
          setIsAuthenticated(false);
          showToast('Signed out. Welcome to Really Simple Social portal.');
        }}
        walletBalance={walletBalance}
        profile={profile}
        onSyncCloud={handleSyncCloud}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            posts={posts}
            accounts={accounts}
            orders={orders}
            walletBalance={walletBalance}
            transactions={transactions}
            profile={profile}
            onOpenComposer={() => {
              setComposerInitialDate(undefined);
              setComposerInitialMedia(undefined);
              setComposerOpen(true);
            }}
            onOpenDeposit={() => setDepositOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onPublishNow={handlePublishNow}
          />
        )}

        {activeTab === 'scheduler' && (
          <PostSchedulerView
            posts={posts}
            onOpenComposer={(initialDate) => {
              setComposerInitialDate(initialDate);
              setComposerInitialMedia(undefined);
              setComposerOpen(true);
            }}
            onPublishNow={handlePublishNow}
            onDeletePost={handleDeletePost}
            onBoostPost={handleBoostPost}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView accounts={accounts} />
        )}

        {activeTab === 'smm' && (
          <SMMStoreView
            orders={orders}
            walletBalance={walletBalance}
            onOpenDeposit={() => setDepositOpen(true)}
            onSubmitOrder={handleSubmitSMMOrder}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            walletBalance={walletBalance}
            transactions={transactions}
            profile={profile}
            onOpenDeposit={() => setDepositOpen(true)}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'storage' && (
          <MediaStorageView
            assets={mediaAssets}
            onUploadAsset={handleUploadAsset}
            onUseAssetInPost={handleUseAssetInPost}
            onDeleteAsset={handleDeleteAsset}
            onSyncCloud={handleSyncCloud}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'security' && (
          <ProfileSecurityView
            profile={profile}
            accounts={accounts}
            auditLogs={auditLogs}
            onUpdateProfile={handleUpdateProfile}
            onToggleAccountConnect={handleToggleAccountConnect}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={profile}
            onRefreshAppState={refreshStateFromStorage}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <PostComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSavePost={handleSavePost}
        assets={mediaAssets}
        initialDate={composerInitialDate}
        initialMediaUrl={composerInitialMedia}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        profile={profile}
        onAddDeposit={handleAddDeposit}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      <SyncStatusModal
        isOpen={syncQueueOpen}
        onClose={() => setSyncQueueOpen(false)}
        queue={offlineQueue}
        onSyncCloud={handleSyncCloud}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* User Dashboard & Sign-Up / Login Modal */}
      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentProfile={profile}
        onAuthSuccess={() => {
          refreshStateFromStorage();
          showToast('Account credentials and Naira wallet synchronized!');
        }}
      />
    </div>
  );
}
