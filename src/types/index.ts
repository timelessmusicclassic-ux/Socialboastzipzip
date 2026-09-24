export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin' | 'facebook';

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface ScheduledPost {
  id: string;
  platforms: SocialPlatform[];
  content: string;
  mediaUrls: string[];
  scheduledAt: string; // ISO date string
  status: PostStatus;
  createdAt: string;
  tags: string[];
  engagementEstimate?: {
    predictedReach: number;
    predictedLikes: number;
    predictedComments: number;
  };
  syncedToCloud: boolean;
}

export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName: string;
  avatarUrl: string;
  followers: number;
  following: number;
  postsCount: number;
  connected: boolean;
  tokenExpiresAt: string;
  growthRate: number; // e.g., +14.2%
}

export interface AnalyticsMetric {
  date: string;
  followers: number;
  impressions: number;
  engagementRate: number;
  reach: number;
}

export interface PlatformAnalytics {
  platform: SocialPlatform;
  followers: number;
  growth: number;
  engagement: number;
  topPost: string;
  color: string;
}

export interface SMMService {
  id: string;
  category: 'Instagram' | 'TikTok' | 'YouTube' | 'X/Twitter' | 'Facebook' | 'LinkedIn';
  name: string;
  ratePer1k: number; // in NGN (Naira)
  minOrder: number;
  maxOrder: number;
  description: string;
  averageTime: string;
  guarantee: string;
  iconName: string;
  audienceType?: 'Targeted Local & Global' | 'Organic Creator Engagers' | 'High Retention Algorithmic' | 'Monetization Partner' | string;
  targetingTier?: 'Tier 1 Executive' | 'High-Density Organic' | 'Monetization Compliant' | 'Viral Momentum' | string;
  qualityScore?: number;
  retentionRate?: string;
  supportedRegions?: string[];
  supportedNiches?: string[];
  safeForExplore?: boolean;
}

export interface SMMOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  targetLink: string;
  quantity: number;
  cost: number; // in NGN
  status: 'Pending' | 'In Progress' | 'Completed' | 'Processing';
  startCount: number;
  remains: number;
  createdAt: string;
  syncedToCloud: boolean;
  targetRegion?: string;
  targetNiche?: string;
  deliverySpeed?: string;
  audienceQuality?: string;
}

export const ADMIN_WALLET_ACCOUNT = {
  accountNumber: '2074308390',
  bankType: 'Kuda',
  walletType: 'Social funding',
  assistanceBankingName: 'Nkechi gift',
  adminEmail: 'timelessmusicclassic@gmail.com'
};

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'smm_order' | 'boost' | 'refund';
  amount: number; // in NGN
  currency: 'NGN';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  referenceId: string;
  paymentMethod:
    | 'Admin Wallet Transfer (Kuda Bank - 2074308390)'
    | 'Bank Transfer (Instant NGN)'
    | 'Internal Naira Balance'
    | string;
  senderName?: string;
  senderBank?: string;
  senderAccountNumber?: string;
  verificationToken?: string;
  adminApprovedAt?: string;
  approvedBy?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  sizeBytes: number;
  dimensions?: string;
  uploadedAt: string;
  tags: string[];
  syncedToCloud: boolean;
}

export interface SecurityAuditLog {
  id: string;
  event: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: 'success' | 'suspicious' | 'blocked';
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  role: 'Super Admin' | 'Agency Lead' | 'Creator' | 'Member';
  plan: 'Growth Pro - Really Simple Social' | 'Starter' | 'Enterprise';
  timezone: string;
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  apiKey: string;
  cloudSyncFrequency: 'realtime' | '5min' | 'hourly';
  currency: 'NGN';
  virtualAccountNumber?: string;
  virtualBankName?: string;
  emailVerified?: boolean;
}

export interface RegisteredUser {
  id: string;
  name: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  password?: string;
  avatarUrl: string;
  role: 'Agency Lead' | 'Creator' | 'Member' | 'Super Admin';
  createdAt: string;
  virtualAccountNumber: string;
  virtualBankName: string;
  emailVerified: boolean;
  recoveryCode?: string;
  securityStatus?: 'active' | 'verified' | 'flagged' | 'suspended';
  walletBalance?: number;
}

export interface FundingPaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  amount: number;
  currency: 'NGN';
  paymentMethod: string;
  senderName: string;
  senderBank: string;
  senderAccountNumber: string;
  sixDigitCode: string; // 6-digit confirmation code
  reference: string;
  status: 'pending' | 'code_dispatched' | 'confirmed' | 'declined';
  requestedAt: string;
  decidedAt?: string;
  signatureVerified?: boolean;
  adminNotes?: string;
}

export interface AdminRecoveryRecord {
  id: string;
  userId: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  registeredAt: string;
  status: 'active' | 'verified' | 'flagged';
  recoveryCode: string;
  virtualAccount: string;
  role: string;
  ipAddress: string;
}

export interface FundingVerificationSession {
  token: string; // 6-digit code
  amount: number; // NGN
  email: string; // recipient
  adminEmail: string; // admin recipient (timelessmusicclassic@gmail.com)
  paymentMethod: string;
  reference: string;
  senderName?: string;
  senderBank?: string;
  senderAccountNumber?: string;
  createdAt: number;
  expiresAt: number;
}

export interface OfflineSyncItem {
  id: string;
  type: 'post' | 'order' | 'media' | 'profile_update';
  action: 'create' | 'update' | 'delete';
  data: any;
  queuedAt: string;
  status: 'queued' | 'syncing' | 'synced' | 'conflict';
}

export interface OptimalTimeSlot {
  id: string;
  platform: SocialPlatform | 'all';
  dayName: string; // e.g., 'Today', 'Tomorrow', 'Wednesday'
  dayOffset: number; // 0 for today, 1 for tomorrow, etc.
  hour: number; // 0-23
  minute: number; // 0 or 30
  formattedTime: string; // e.g. '7:30 PM'
  engagementMultiplier: string; // e.g. '2.8x Peak Velocity'
  audienceOnlinePercent: number; // e.g. 94
  recommendedFormat: string; // e.g. 'Carousel / Reel'
  historicalInsight: string; // Contextual explanation based on historical engagement
  trafficTier: 'peak' | 'high' | 'moderate';
}

export interface PlatformEngagementMatrix {
  platform: SocialPlatform | 'all';
  peakWindows: string[];
  averageLiftPercent: number;
  bestDay: string;
  heatGrid: number[][]; // 7 days x 24 hours (0-100 intensity)
}
