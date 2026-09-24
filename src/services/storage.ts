import {
  UserProfile,
  ConnectedAccount,
  ScheduledPost,
  SMMOrder,
  WalletTransaction,
  MediaAsset,
  SecurityAuditLog,
  OfflineSyncItem,
  RegisteredUser,
  AdminRecoveryRecord,
  FundingVerificationSession,
  FundingPaymentRequest
} from '../types';
import {
  initialProfile,
  initialAccounts,
  initialScheduledPosts,
  initialSMMOrders,
  initialWalletTransactions,
  initialMediaAssets,
  initialAuditLogs,
  initialRegisteredUsers,
  initialFundingRequests
} from '../data/initialData';

const KEYS = {
  PROFILE: 'rss_user_profile_ngn',
  ACCOUNTS: 'rss_connected_accounts',
  POSTS: 'rss_scheduled_posts',
  ORDERS: 'rss_smm_orders_ngn',
  WALLET_TX: 'rss_wallet_transactions_ngn',
  MEDIA: 'rss_media_assets',
  AUDIT_LOGS: 'rss_security_audit_logs',
  OFFLINE_QUEUE: 'rss_offline_sync_queue',
  FORCE_OFFLINE: 'rss_force_offline_mode',
  LAST_SYNC: 'rss_last_cloud_sync',
  REGISTERED_USERS: 'rss_registered_users_ngn',
  ADMIN_RECOVERY: 'rss_admin_recovery_list',
  PENDING_FUNDING: 'rss_pending_funding_session',
  FUNDING_REQUESTS: 'rss_funding_payment_requests',
  THEME: 'rss_theme_mode'
};

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Check network online status
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    const forcedOffline = localStorage.getItem(KEYS.FORCE_OFFLINE) === 'true';
    if (forcedOffline) return false;
    return navigator.onLine;
  }

  setForceOffline(force: boolean): void {
    localStorage.setItem(KEYS.FORCE_OFFLINE, force ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('rss_connectivity_change', { detail: { online: !force } }));
  }

  getForceOffline(): boolean {
    return localStorage.getItem(KEYS.FORCE_OFFLINE) === 'true';
  }

  getLastSyncTime(): string {
    return localStorage.getItem(KEYS.LAST_SYNC) || new Date().toISOString();
  }

  setLastSyncTime(isoDate: string): void {
    localStorage.setItem(KEYS.LAST_SYNC, isoDate);
  }

  // Global Theme Mode (Light / Dark) for late-night social management
  getTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  setTheme(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
    window.dispatchEvent(new CustomEvent('rss_theme_changed', { detail: { theme } }));
  }

  toggleTheme(): 'light' | 'dark' {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  // Profile
  getProfile(): UserProfile {
    const saved = localStorage.getItem(KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
    this.saveProfile(initialProfile);
    return initialProfile;
  }

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    if (!this.isOnline()) {
      this.enqueueOfflineSync('profile_update', 'update', profile);
    }
  }

  // Accounts
  getAccounts(): ConnectedAccount[] {
    const saved = localStorage.getItem(KEYS.ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
    this.saveAccounts(initialAccounts);
    return initialAccounts;
  }

  saveAccounts(accounts: ConnectedAccount[]): void {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  // Posts
  getPosts(): ScheduledPost[] {
    const saved = localStorage.getItem(KEYS.POSTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse posts', e);
      }
    }
    this.savePosts(initialScheduledPosts);
    return initialScheduledPosts;
  }

  savePosts(posts: ScheduledPost[]): void {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  }

  addPost(post: ScheduledPost): void {
    const posts = this.getPosts();
    const online = this.isOnline();
    const newPost: ScheduledPost = {
      ...post,
      syncedToCloud: online
    };
    posts.unshift(newPost);
    this.savePosts(posts);

    if (!online) {
      this.enqueueOfflineSync('post', 'create', newPost);
    } else {
      this.setLastSyncTime(new Date().toISOString());
    }
  }

  updatePost(updatedPost: ScheduledPost): void {
    const posts = this.getPosts();
    const online = this.isOnline();
    const idx = posts.findIndex(p => p.id === updatedPost.id);
    if (idx !== -1) {
      posts[idx] = {
        ...updatedPost,
        syncedToCloud: online
      };
      this.savePosts(posts);
      if (!online) {
        this.enqueueOfflineSync('post', 'update', posts[idx]);
      } else {
        this.setLastSyncTime(new Date().toISOString());
      }
    }
  }

  deletePost(postId: string): void {
    let posts = this.getPosts();
    const postToDelete = posts.find(p => p.id === postId);
    posts = posts.filter(p => p.id !== postId);
    this.savePosts(posts);
    if (!this.isOnline() && postToDelete) {
      this.enqueueOfflineSync('post', 'delete', { id: postId });
    }
  }

  // SMM Orders
  getOrders(): SMMOrder[] {
    const saved = localStorage.getItem(KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse orders', e);
      }
    }
    this.saveOrders(initialSMMOrders);
    return initialSMMOrders;
  }

  saveOrders(orders: SMMOrder[]): void {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }

  addOrder(order: SMMOrder): void {
    const orders = this.getOrders();
    const online = this.isOnline();
    const newOrder: SMMOrder = {
      ...order,
      syncedToCloud: online
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);

    if (!online) {
      this.enqueueOfflineSync('order', 'create', newOrder);
    } else {
      this.setLastSyncTime(new Date().toISOString());
    }
  }

  // Wallet Transactions
  getWalletTransactions(): WalletTransaction[] {
    const saved = localStorage.getItem(KEYS.WALLET_TX);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse transactions', e);
      }
    }
    this.saveWalletTransactions(initialWalletTransactions);
    return initialWalletTransactions;
  }

  saveWalletTransactions(txs: WalletTransaction[]): void {
    localStorage.setItem(KEYS.WALLET_TX, JSON.stringify(txs));
  }

  addWalletTransaction(tx: WalletTransaction): void {
    const txs = this.getWalletTransactions();
    txs.unshift(tx);
    this.saveWalletTransactions(txs);
  }

  approveTransaction(txId: string): WalletTransaction | null {
    const txs = this.getWalletTransactions();
    const index = txs.findIndex(t => t.id === txId);
    if (index !== -1 && txs[index].status === 'pending') {
      txs[index].status = 'completed';
      txs[index].adminApprovedAt = new Date().toISOString();
      txs[index].approvedBy = 'Admin (Nkechi gift / Kuda Social funding)';
      this.saveWalletTransactions(txs);
      this.addAuditLog({
        event: `Admin Approved Deposit #${txId} (+₦${txs[index].amount.toLocaleString()})`,
        ip: '192.0.2.14',
        location: 'Admin Review Console',
        device: 'Kuda Social Funding Terminal',
        status: 'success'
      });
      window.dispatchEvent(new CustomEvent('rss_storage_changed'));
      return txs[index];
    }
    return null;
  }

  approveAllPendingTransactions(): number {
    const txs = this.getWalletTransactions();
    let count = 0;
    const now = new Date().toISOString();
    txs.forEach(t => {
      if (t.status === 'pending') {
        t.status = 'completed';
        t.adminApprovedAt = now;
        t.approvedBy = 'Admin (Nkechi gift / Kuda Social funding)';
        count++;
      }
    });
    if (count > 0) {
      this.saveWalletTransactions(txs);
      this.addAuditLog({
        event: `Admin Batch Approved ${count} Pending Deposits`,
        ip: '192.0.2.14',
        location: 'Admin Review Console',
        device: 'Kuda Social Funding Terminal',
        status: 'success'
      });
      window.dispatchEvent(new CustomEvent('rss_storage_changed'));
    }
    return count;
  }

  rejectTransaction(txId: string): WalletTransaction | null {
    const txs = this.getWalletTransactions();
    const index = txs.findIndex(t => t.id === txId);
    if (index !== -1 && txs[index].status === 'pending') {
      txs[index].status = 'failed';
      this.saveWalletTransactions(txs);
      this.addAuditLog({
        event: `Admin Rejected Deposit #${txId}`,
        ip: '192.0.2.14',
        location: 'Admin Review Console',
        device: 'Kuda Social Funding Terminal',
        status: 'suspicious'
      });
      window.dispatchEvent(new CustomEvent('rss_storage_changed'));
      return txs[index];
    }
    return null;
  }

  getWalletBalance(): number {
    const txs = this.getWalletTransactions();
    return txs
      .filter(t => t.status === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }

  // Media Assets
  getMediaAssets(): MediaAsset[] {
    const saved = localStorage.getItem(KEYS.MEDIA);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse media assets', e);
      }
    }
    this.saveMediaAssets(initialMediaAssets);
    return initialMediaAssets;
  }

  saveMediaAssets(assets: MediaAsset[]): void {
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(assets));
  }

  addMediaAsset(asset: MediaAsset): void {
    const assets = this.getMediaAssets();
    const online = this.isOnline();
    const newAsset: MediaAsset = {
      ...asset,
      syncedToCloud: online
    };
    assets.unshift(newAsset);
    this.saveMediaAssets(assets);

    if (!online) {
      this.enqueueOfflineSync('media', 'create', newAsset);
    } else {
      this.setLastSyncTime(new Date().toISOString());
    }
  }

  // Security Audit Logs
  getAuditLogs(): SecurityAuditLog[] {
    const saved = localStorage.getItem(KEYS.AUDIT_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse audit logs', e);
      }
    }
    this.saveAuditLogs(initialAuditLogs);
    return initialAuditLogs;
  }

  saveAuditLogs(logs: SecurityAuditLog[]): void {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  addAuditLog(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: SecurityAuditLog = {
      ...log,
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.saveAuditLogs(logs.slice(0, 50)); // keep last 50
  }

  // Offline Sync Queue
  getOfflineQueue(): OfflineSyncItem[] {
    const saved = localStorage.getItem(KEYS.OFFLINE_QUEUE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse offline queue', e);
      }
    }
    return [];
  }

  saveOfflineQueue(queue: OfflineSyncItem[]): void {
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  }

  enqueueOfflineSync(type: OfflineSyncItem['type'], action: OfflineSyncItem['action'], data: any): void {
    const queue = this.getOfflineQueue();
    queue.push({
      id: 'sync_' + Math.random().toString(36).substr(2, 9),
      type,
      action,
      data,
      queuedAt: new Date().toISOString(),
      status: 'queued'
    });
    this.saveOfflineQueue(queue);
    window.dispatchEvent(new CustomEvent('rss_queue_updated', { detail: { count: queue.length } }));
  }

  async syncCloudNow(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      // mark all items as synced in storage
      this.markAllSynced();
      this.setLastSyncTime(new Date().toISOString());
      return { success: true, syncedCount: 0, message: 'All records are already up to date with cloud storage.' };
    }

    // Simulate network latency / cloud handshake
    await new Promise(resolve => setTimeout(resolve, 800));

    // Process queued items and commit to cloud database simulation
    this.markAllSynced();
    this.saveOfflineQueue([]);
    const count = queue.length;
    this.setLastSyncTime(new Date().toISOString());

    this.addAuditLog({
      event: `Cloud Sync Synchronized (${count} pending items)`,
      ip: '127.0.0.1',
      location: 'Local Edge Client',
      device: 'Offline Sync Replay Engine',
      status: 'success'
    });

    window.dispatchEvent(new CustomEvent('rss_queue_updated', { detail: { count: 0 } }));
    return {
      success: true,
      syncedCount: count,
      message: `Successfully synchronized ${count} queued items with cloud database storage.`
    };
  }

  private markAllSynced(): void {
    const posts = this.getPosts().map(p => ({ ...p, syncedToCloud: true }));
    this.savePosts(posts);

    const orders = this.getOrders().map(o => ({ ...o, syncedToCloud: true }));
    this.saveOrders(orders);

    const media = this.getMediaAssets().map(m => ({ ...m, syncedToCloud: true }));
    this.saveMediaAssets(media);
  }

  // Registered Users Directory
  getRegisteredUsers(): RegisteredUser[] {
    const saved = localStorage.getItem(KEYS.REGISTERED_USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse registered users', e);
      }
    }
    this.saveRegisteredUsers(initialRegisteredUsers);
    return initialRegisteredUsers;
  }

  saveRegisteredUsers(users: RegisteredUser[]): void {
    localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
  }

  addRegisteredUser(user: RegisteredUser): void {
    const users = this.getRegisteredUsers();
    const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    this.saveRegisteredUsers(users);

    // Register user in Admin Recovery Data Storage for security and recovery purposes
    this.syncToAdminRecoveryList(user);
  }

  // Admin Recovery Data Storage List
  getAdminRecoveryRecords(): AdminRecoveryRecord[] {
    const saved = localStorage.getItem(KEYS.ADMIN_RECOVERY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse admin recovery records', e);
      }
    }
    // Seed initial records from registered users
    const users = this.getRegisteredUsers();
    const initialRecords: AdminRecoveryRecord[] = users.map(u => ({
      id: 'rec_' + u.id,
      userId: u.id,
      username: u.username || u.email.split('@')[0],
      email: u.email,
      phone: u.phone,
      fullName: u.name,
      registeredAt: u.createdAt,
      status: 'active',
      recoveryCode: u.recoveryCode || 'SEC-REC-' + u.id.slice(-6).toUpperCase(),
      virtualAccount: u.virtualAccountNumber,
      role: u.role,
      ipAddress: '102.89.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10)
    }));
    this.saveAdminRecoveryRecords(initialRecords);
    return initialRecords;
  }

  saveAdminRecoveryRecords(records: AdminRecoveryRecord[]): void {
    localStorage.setItem(KEYS.ADMIN_RECOVERY, JSON.stringify(records));
  }

  syncToAdminRecoveryList(user: RegisteredUser): void {
    const records = this.getAdminRecoveryRecords();
    const recIdx = records.findIndex(r => r.userId === user.id || r.email.toLowerCase() === user.email.toLowerCase());
    const newRecord: AdminRecoveryRecord = {
      id: 'rec_' + user.id,
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      phone: user.phone,
      fullName: user.name,
      registeredAt: user.createdAt,
      status: 'verified',
      recoveryCode: user.recoveryCode || 'SEC-REC-' + user.id.slice(-6).toUpperCase(),
      virtualAccount: user.virtualAccountNumber,
      role: user.role,
      ipAddress: '102.89.23.14 (Lagos, NG)'
    };
    if (recIdx !== -1) {
      records[recIdx] = newRecord;
    } else {
      records.unshift(newRecord);
    }
    this.saveAdminRecoveryRecords(records);
  }

  findUserByEmail(email: string): RegisteredUser | undefined {
    const users = this.getRegisteredUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserByUsernameOrEmail(identifier: string): RegisteredUser | undefined {
    const users = this.getRegisteredUsers();
    const cleanId = identifier.trim().toLowerCase();
    return users.find(u => 
      u.email.toLowerCase() === cleanId || 
      (u.username && u.username.toLowerCase() === cleanId)
    );
  }

  updateUserPassword(emailOrUsername: string, newPassword: string): boolean {
    const users = this.getRegisteredUsers();
    const cleanId = emailOrUsername.trim().toLowerCase();
    const targetIdx = users.findIndex(u => 
      u.email.toLowerCase() === cleanId || 
      (u.username && u.username.toLowerCase() === cleanId)
    );

    if (targetIdx === -1) return false;

    users[targetIdx].password = newPassword;
    this.saveRegisteredUsers(users);

    // If currently active profile matches this user, update active profile
    const activeProfile = this.getProfile();
    if (activeProfile.email.toLowerCase() === users[targetIdx].email.toLowerCase()) {
      this.saveProfile({
        ...activeProfile,
        emailVerified: true
      });
    }

    return true;
  }

  // Pending Funding Token Verification Session
  getPendingFunding(): FundingVerificationSession | null {
    const saved = localStorage.getItem(KEYS.PENDING_FUNDING);
    if (saved) {
      try {
        const session: FundingVerificationSession = JSON.parse(saved);
        if (session.expiresAt > Date.now()) {
          return session;
        } else {
          this.clearPendingFunding();
        }
      } catch (e) {
        console.error('Failed to parse pending funding', e);
      }
    }
    return null;
  }

  savePendingFunding(session: FundingVerificationSession): void {
    localStorage.setItem(KEYS.PENDING_FUNDING, JSON.stringify(session));
  }

  clearPendingFunding(): void {
    localStorage.removeItem(KEYS.PENDING_FUNDING);
  }

  // Admin Managed Funding Payment Requests (6-Digit Code Approval Flow)
  getFundingRequests(): FundingPaymentRequest[] {
    const saved = localStorage.getItem(KEYS.FUNDING_REQUESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse funding requests', e);
      }
    }
    this.saveFundingRequests(initialFundingRequests);
    return initialFundingRequests;
  }

  saveFundingRequests(requests: FundingPaymentRequest[]): void {
    localStorage.setItem(KEYS.FUNDING_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('rss_funding_requests_updated', { detail: { requests } }));
  }

  addFundingRequest(req: FundingPaymentRequest): void {
    const list = this.getFundingRequests();
    const existingIdx = list.findIndex(r => r.id === req.id || r.reference === req.reference);
    if (existingIdx !== -1) {
      list[existingIdx] = req;
    } else {
      list.unshift(req);
    }
    this.saveFundingRequests(list);

    // Record audit log
    this.addAuditLog({
      event: `New Funding Request #${req.id.slice(-6)} Submitted: ₦${req.amount.toLocaleString()} by ${req.userName} (${req.userEmail})`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria',
      device: 'User Funding Portal',
      status: 'success'
    });
  }

  // Admin approves payment and dispatches the 6-digit code to user's registered email
  confirmAndDispatchFundingCode(requestId: string): { success: boolean; message: string; request?: FundingPaymentRequest } {
    const requests = this.getFundingRequests();
    const targetIdx = requests.findIndex(r => r.id === requestId);
    if (targetIdx === -1) {
      return { success: false, message: 'Funding request not found.' };
    }

    const target = requests[targetIdx];
    target.status = 'code_dispatched';
    target.signatureVerified = true;
    target.decidedAt = new Date().toISOString();
    requests[targetIdx] = target;
    this.saveFundingRequests(requests);

    // Save as active pending funding session so user can enter the 6-digit code
    const session: FundingVerificationSession = {
      token: target.sixDigitCode,
      amount: target.amount,
      email: target.userEmail,
      adminEmail: 'timelessmusicclassic@gmail.com',
      paymentMethod: target.paymentMethod,
      reference: target.reference,
      senderName: target.senderName,
      senderBank: target.senderBank,
      senderAccountNumber: target.senderAccountNumber,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 30 // 30 mins
    };
    this.savePendingFunding(session);

    // Broadcast email delivery event for instant user receipt
    window.dispatchEvent(
      new CustomEvent('rss_funding_code_delivered', {
        detail: {
          requestId: target.id,
          code: target.sixDigitCode,
          amount: target.amount,
          userEmail: target.userEmail,
          reference: target.reference,
          message: `Admin has confirmed your payment! Your 6-digit confirmation code (${target.sixDigitCode}) has been delivered to your email: ${target.userEmail}.`
        }
      })
    );

    this.addAuditLog({
      event: `Admin CONFIRMED Payment #${target.id.slice(-6)}: 6-Digit Code (${target.sixDigitCode}) delivered to ${target.userEmail} for ₦${target.amount.toLocaleString()}`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria (Admin Desk)',
      device: 'Admin Dashboard Control',
      status: 'success'
    });

    return {
      success: true,
      message: `Payment confirmed! 6-digit code (${target.sixDigitCode}) successfully dispatched to ${target.userEmail}.`,
      request: target
    };
  }

  // Admin directly approves and completes the funding immediately
  approveAndCreditFundingRequest(requestId: string, adminNotes?: string): { success: boolean; message: string; request?: FundingPaymentRequest } {
    const requests = this.getFundingRequests();
    const targetIdx = requests.findIndex(r => r.id === requestId);
    if (targetIdx === -1) {
      return { success: false, message: 'Funding request not found.' };
    }

    const target = requests[targetIdx];
    target.status = 'confirmed';
    target.signatureVerified = true;
    target.decidedAt = new Date().toISOString();
    if (adminNotes) target.adminNotes = adminNotes;
    requests[targetIdx] = target;
    this.saveFundingRequests(requests);

    // Credit user's wallet
    this.updateUserWalletBalance(target.userId, target.amount, `Admin approved funding payment #${target.reference}`);

    this.clearPendingFunding();

    window.dispatchEvent(
      new CustomEvent('rss_funding_completed', {
        detail: {
          requestId: target.id,
          amount: target.amount,
          userEmail: target.userEmail,
          reference: target.reference,
          status: 'confirmed'
        }
      })
    );

    return {
      success: true,
      message: `Payment approved! ₦${target.amount.toLocaleString()} has been credited to ${target.userName}'s wallet.`,
      request: target
    };
  }

  // Admin declines payment funding request
  declineFundingRequest(requestId: string, adminNotes?: string): { success: boolean; message: string; request?: FundingPaymentRequest } {
    const requests = this.getFundingRequests();
    const targetIdx = requests.findIndex(r => r.id === requestId);
    if (targetIdx === -1) {
      return { success: false, message: 'Funding request not found.' };
    }

    const target = requests[targetIdx];
    target.status = 'declined';
    target.decidedAt = new Date().toISOString();
    target.adminNotes = adminNotes || 'Declined by Administrator during payment verification';
    requests[targetIdx] = target;
    this.saveFundingRequests(requests);

    this.clearPendingFunding();

    // Broadcast decline event
    window.dispatchEvent(
      new CustomEvent('rss_funding_declined', {
        detail: {
          requestId: target.id,
          amount: target.amount,
          userEmail: target.userEmail,
          reference: target.reference,
          reason: target.adminNotes
        }
      })
    );

    this.addAuditLog({
      event: `Admin DECLINED Funding Request #${target.id.slice(-6)} of ₦${target.amount.toLocaleString()} for ${target.userEmail}. Reason: ${target.adminNotes}`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria (Admin Desk)',
      device: 'Admin Dashboard Control',
      status: 'suspicious'
    });

    return {
      success: true,
      message: `Funding request for ₦${target.amount.toLocaleString()} was declined.`,
      request: target
    };
  }

  // Admin Direct User Wallet Funding / Adjustment
  updateUserWalletBalance(userId: string, deltaAmount: number, reason = 'Admin Balance Adjustment'): boolean {
    const users = this.getRegisteredUsers();
    const userIdx = users.findIndex(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    
    if (userIdx !== -1) {
      const current = users[userIdx].walletBalance || 0;
      const updatedBalance = Math.max(0, current + deltaAmount);
      users[userIdx].walletBalance = updatedBalance;
      this.saveRegisteredUsers(users);
    }

    // Also check active profile
    const activeProfile = this.getProfile();
    const isActiveUser = activeProfile.id === userId || activeProfile.email.toLowerCase() === userId.toLowerCase();
    
    // Add wallet transaction record which automatically updates getWalletBalance()
    const newTx: WalletTransaction = {
      id: 'tx_adm_' + Date.now().toString().slice(-6),
      type: deltaAmount >= 0 ? 'deposit' : 'refund',
      amount: deltaAmount,
      currency: 'NGN',
      status: 'completed',
      date: new Date().toISOString(),
      description: reason,
      referenceId: 'REF_ADM_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      paymentMethod: 'Admin Direct Credit'
    };
    this.addWalletTransaction(newTx);

    this.addAuditLog({
      event: `Admin Wallet Balance Adjustment: ${deltaAmount >= 0 ? '+' : ''}₦${deltaAmount.toLocaleString()} to User ID [${userId}] (${reason})`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria',
      device: 'Admin Dashboard Portal',
      status: 'success'
    });

    window.dispatchEvent(new CustomEvent('rss_storage_changed'));
    return true;
  }

  // Admin Reset User Password & Access
  adminResetUserAccess(userId: string, newPassword?: string): { success: boolean; temporaryPassword?: string } {
    const users = this.getRegisteredUsers();
    const targetIdx = users.findIndex(u => u.id === userId);
    if (targetIdx === -1) return { success: false };

    const generatedPassword = newPassword || 'ResetPass' + Math.floor(1000 + Math.random() * 9000) + '!';
    users[targetIdx].password = generatedPassword;
    users[targetIdx].securityStatus = 'active';
    users[targetIdx].recoveryCode = 'SEC-REC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    this.saveRegisteredUsers(users);

    this.addAuditLog({
      event: `Admin Reset Access & Password for user: ${users[targetIdx].email} (${users[targetIdx].name})`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria',
      device: 'Admin Dashboard Security Control',
      status: 'success'
    });

    return { success: true, temporaryPassword: generatedPassword };
  }

  // Admin Update User Role or Status
  updateUserRoleAndStatus(userId: string, updates: { role?: RegisteredUser['role']; status?: RegisteredUser['securityStatus'] }): boolean {
    const users = this.getRegisteredUsers();
    const targetIdx = users.findIndex(u => u.id === userId);
    if (targetIdx === -1) return false;

    if (updates.role) users[targetIdx].role = updates.role;
    if (updates.status) users[targetIdx].securityStatus = updates.status;

    this.saveRegisteredUsers(users);

    this.addAuditLog({
      event: `Admin Updated User [${userId}] Profile: Role=${updates.role || 'unchanged'}, Status=${updates.status || 'unchanged'}`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria',
      device: 'Admin Dashboard Control',
      status: 'success'
    });

    return true;
  }

  // Admin Delete User
  deleteRegisteredUser(userId: string): boolean {
    const users = this.getRegisteredUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length === users.length) return false;

    this.saveRegisteredUsers(filtered);
    this.addAuditLog({
      event: `Admin Removed User Account [${userId}] from platform registry`,
      ip: '102.89.23.14',
      location: 'Lagos, Nigeria',
      device: 'Admin Dashboard Control',
      status: 'suspicious'
    });
    return true;
  }

  // Backup and Restore
  exportDatabaseJSON(): string {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      app: 'Really Simple Social',
      version: '2.4.0',
      profile: this.getProfile(),
      accounts: this.getAccounts(),
      posts: this.getPosts(),
      orders: this.getOrders(),
      walletTransactions: this.getWalletTransactions(),
      mediaAssets: this.getMediaAssets(),
      auditLogs: this.getAuditLogs(),
      walletBalance: this.getWalletBalance()
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  restoreDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) this.saveProfile(data.profile);
      if (data.accounts) this.saveAccounts(data.accounts);
      if (data.posts) this.savePosts(data.posts);
      if (data.orders) this.saveOrders(data.orders);
      if (data.walletTransactions) this.saveWalletTransactions(data.walletTransactions);
      if (data.mediaAssets) this.saveMediaAssets(data.mediaAssets);
      if (data.auditLogs) this.saveAuditLogs(data.auditLogs);
      this.setLastSyncTime(new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  }

  resetToDefaults(): void {
    this.saveProfile(initialProfile);
    this.saveAccounts(initialAccounts);
    this.savePosts(initialScheduledPosts);
    this.saveOrders(initialSMMOrders);
    this.saveWalletTransactions(initialWalletTransactions);
    this.saveMediaAssets(initialMediaAssets);
    this.saveAuditLogs(initialAuditLogs);
    this.saveOfflineQueue([]);
    localStorage.removeItem(KEYS.FORCE_OFFLINE);
    this.setLastSyncTime(new Date().toISOString());
  }
}

export const storage = StorageService.getInstance();
