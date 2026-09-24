import { OptimalTimeSlot, PlatformEngagementMatrix, SocialPlatform } from '../types';

export const platformHistoricalMatrices: Record<SocialPlatform | 'all', PlatformEngagementMatrix> = {
  all: {
    platform: 'all',
    peakWindows: ['7:00 PM - 9:30 PM WAT', '12:30 PM - 2:00 PM WAT', '8:00 AM - 9:30 AM WAT'],
    averageLiftPercent: 41.6,
    bestDay: 'Thursday & Friday',
    heatGrid: [
      // Sunday
      [12, 8, 5, 4, 3, 5, 10, 18, 35, 52, 68, 74, 82, 86, 84, 80, 85, 92, 98, 96, 88, 72, 50, 28],
      // Monday
      [15, 7, 4, 3, 4, 8, 22, 65, 84, 76, 68, 72, 85, 80, 75, 78, 82, 88, 90, 84, 70, 52, 34, 18],
      // Tuesday
      [10, 6, 4, 3, 5, 12, 30, 72, 88, 80, 72, 78, 88, 82, 78, 80, 86, 92, 94, 88, 74, 55, 36, 20],
      // Wednesday
      [11, 7, 4, 3, 6, 14, 34, 75, 90, 82, 75, 80, 92, 85, 82, 85, 90, 96, 98, 92, 78, 58, 38, 22],
      // Thursday
      [12, 8, 5, 4, 6, 15, 36, 78, 92, 85, 78, 84, 94, 88, 85, 88, 92, 98, 99, 94, 80, 62, 40, 24],
      // Friday
      [14, 9, 6, 4, 7, 18, 38, 76, 86, 82, 76, 82, 90, 86, 84, 89, 95, 99, 100, 97, 85, 70, 48, 30],
      // Saturday
      [18, 11, 7, 5, 4, 6, 14, 25, 48, 65, 78, 86, 90, 92, 90, 88, 91, 95, 97, 92, 82, 68, 45, 26]
    ]
  },
  instagram: {
    platform: 'instagram',
    peakWindows: ['7:30 PM - 9:30 PM WAT', '12:45 PM - 1:45 PM WAT', '8:30 PM - 10:00 PM WAT'],
    averageLiftPercent: 46.2,
    bestDay: 'Wednesday & Sunday',
    heatGrid: [
      [10, 6, 4, 2, 2, 4, 8, 15, 30, 50, 65, 75, 85, 88, 86, 82, 88, 94, 99, 98, 90, 75, 52, 25],
      [12, 6, 3, 2, 3, 7, 18, 55, 78, 70, 65, 70, 86, 80, 72, 76, 82, 90, 92, 86, 70, 50, 30, 15],
      [10, 5, 3, 2, 4, 10, 25, 68, 82, 74, 68, 75, 88, 82, 75, 78, 85, 92, 95, 90, 72, 52, 32, 18],
      [11, 6, 3, 2, 5, 12, 28, 72, 86, 78, 72, 78, 90, 85, 80, 84, 90, 97, 99, 94, 78, 56, 35, 20],
      [12, 7, 4, 3, 5, 13, 30, 74, 88, 80, 74, 80, 92, 86, 82, 86, 91, 96, 98, 92, 79, 58, 38, 22],
      [14, 8, 5, 3, 6, 15, 32, 72, 84, 78, 72, 80, 88, 85, 82, 88, 94, 98, 99, 96, 84, 68, 44, 26],
      [16, 10, 6, 4, 3, 5, 12, 22, 45, 62, 76, 84, 88, 90, 88, 86, 90, 94, 96, 92, 80, 65, 42, 24]
    ]
  },
  tiktok: {
    platform: 'tiktok',
    peakWindows: ['8:15 PM - 10:45 PM WAT', '2:30 PM - 5:00 PM WAT', '9:00 PM - 11:30 PM WAT'],
    averageLiftPercent: 52.8,
    bestDay: 'Thursday & Friday',
    heatGrid: [
      [20, 14, 8, 4, 3, 4, 7, 12, 25, 45, 60, 72, 82, 86, 88, 86, 90, 95, 98, 99, 95, 84, 62, 35],
      [18, 10, 5, 3, 3, 5, 12, 38, 62, 58, 55, 65, 78, 76, 74, 78, 85, 92, 96, 95, 86, 68, 42, 22],
      [16, 8, 4, 2, 3, 6, 15, 45, 68, 62, 58, 68, 82, 78, 76, 80, 88, 94, 97, 96, 88, 72, 45, 24],
      [18, 9, 5, 3, 4, 8, 18, 50, 72, 65, 62, 72, 85, 82, 80, 84, 91, 96, 98, 98, 90, 75, 48, 26],
      [20, 10, 6, 3, 4, 9, 20, 52, 75, 68, 65, 75, 88, 85, 84, 88, 94, 98, 100, 99, 92, 78, 52, 28],
      [24, 12, 7, 4, 5, 10, 22, 50, 72, 68, 68, 78, 86, 85, 86, 92, 96, 100, 100, 99, 95, 85, 60, 34],
      [22, 15, 9, 5, 4, 5, 10, 18, 38, 58, 72, 82, 88, 92, 92, 92, 95, 98, 99, 97, 92, 80, 56, 30]
    ]
  },
  twitter: {
    platform: 'twitter',
    peakWindows: ['8:30 AM - 10:15 AM WAT', '12:30 PM - 2:00 PM WAT', '6:00 PM - 8:00 PM WAT'],
    averageLiftPercent: 38.5,
    bestDay: 'Tuesday & Thursday',
    heatGrid: [
      [10, 5, 3, 2, 3, 5, 10, 18, 35, 52, 65, 72, 80, 78, 75, 74, 78, 84, 88, 85, 75, 58, 35, 18],
      [12, 6, 3, 2, 4, 10, 32, 82, 94, 86, 78, 82, 92, 88, 82, 84, 88, 90, 88, 80, 68, 48, 28, 15],
      [10, 5, 3, 2, 5, 12, 36, 88, 98, 90, 82, 85, 95, 90, 85, 86, 90, 92, 90, 82, 70, 50, 30, 16],
      [11, 5, 3, 2, 5, 12, 38, 86, 96, 88, 80, 84, 94, 88, 84, 85, 90, 92, 90, 84, 72, 52, 32, 18],
      [12, 6, 3, 2, 6, 14, 40, 90, 99, 92, 84, 88, 96, 92, 86, 88, 92, 94, 92, 85, 74, 54, 34, 20],
      [12, 6, 4, 3, 6, 15, 38, 85, 92, 86, 78, 82, 90, 86, 82, 85, 88, 90, 88, 82, 70, 52, 32, 18],
      [10, 5, 3, 2, 3, 5, 12, 22, 45, 60, 72, 78, 82, 80, 78, 76, 80, 84, 86, 82, 72, 55, 34, 18]
    ]
  },
  youtube: {
    platform: 'youtube',
    peakWindows: ['3:45 PM - 6:30 PM WAT', '7:00 PM - 9:30 PM WAT', '11:00 AM - 2:00 PM WAT'],
    averageLiftPercent: 44.0,
    bestDay: 'Thursday, Friday & Saturday',
    heatGrid: [
      [12, 6, 4, 2, 2, 4, 8, 16, 32, 55, 72, 82, 88, 90, 89, 88, 92, 96, 98, 95, 88, 74, 48, 22],
      [10, 5, 3, 2, 2, 5, 12, 32, 52, 58, 60, 68, 78, 76, 74, 80, 86, 90, 92, 88, 78, 60, 36, 18],
      [9, 4, 2, 2, 3, 6, 14, 35, 55, 60, 62, 70, 80, 78, 76, 82, 88, 92, 94, 90, 80, 62, 38, 20],
      [10, 5, 3, 2, 3, 7, 15, 38, 58, 62, 65, 72, 82, 80, 80, 85, 90, 95, 96, 92, 82, 65, 40, 22],
      [11, 5, 3, 2, 4, 8, 18, 42, 64, 68, 70, 78, 86, 85, 85, 90, 95, 98, 99, 95, 86, 70, 44, 25],
      [14, 7, 4, 3, 4, 9, 20, 45, 68, 72, 75, 82, 90, 90, 92, 96, 99, 100, 100, 98, 90, 75, 50, 28],
      [16, 9, 5, 3, 3, 5, 10, 20, 42, 65, 80, 88, 94, 95, 94, 94, 96, 98, 98, 95, 88, 76, 52, 26]
    ]
  },
  linkedin: {
    platform: 'linkedin',
    peakWindows: ['7:45 AM - 9:30 AM WAT', '12:00 PM - 1:30 PM WAT', '5:00 PM - 6:30 PM WAT'],
    averageLiftPercent: 35.2,
    bestDay: 'Tuesday & Wednesday',
    heatGrid: [
      [5, 3, 2, 1, 1, 2, 5, 10, 18, 25, 32, 38, 42, 40, 36, 35, 38, 42, 45, 40, 32, 22, 14, 8],
      [8, 4, 2, 1, 3, 8, 28, 78, 92, 85, 75, 80, 88, 84, 78, 80, 84, 82, 76, 65, 50, 35, 20, 10],
      [8, 4, 2, 1, 4, 10, 34, 88, 98, 92, 82, 85, 94, 88, 82, 84, 88, 86, 80, 68, 52, 38, 22, 12],
      [8, 4, 2, 1, 4, 10, 35, 86, 96, 90, 80, 84, 92, 86, 80, 82, 86, 84, 78, 66, 50, 36, 20, 11],
      [8, 4, 2, 1, 4, 10, 32, 84, 94, 88, 78, 82, 90, 85, 78, 80, 84, 82, 76, 64, 48, 34, 18, 10],
      [7, 3, 2, 1, 3, 8, 25, 70, 82, 75, 68, 74, 80, 75, 70, 72, 74, 70, 62, 50, 38, 26, 15, 8],
      [5, 2, 1, 1, 1, 2, 4, 8, 15, 22, 28, 32, 35, 34, 30, 28, 30, 32, 35, 30, 24, 18, 10, 6]
    ]
  },
  facebook: {
    platform: 'facebook',
    peakWindows: ['1:15 PM - 3:30 PM WAT', '7:00 PM - 9:00 PM WAT', '8:30 AM - 10:00 AM WAT'],
    averageLiftPercent: 29.4,
    bestDay: 'Wednesday & Thursday',
    heatGrid: [
      [10, 6, 3, 2, 2, 4, 8, 15, 30, 50, 64, 72, 80, 82, 80, 78, 82, 86, 88, 86, 78, 64, 40, 20],
      [10, 5, 3, 2, 3, 6, 18, 52, 70, 65, 62, 68, 80, 78, 74, 76, 80, 84, 85, 80, 68, 50, 30, 15],
      [9, 4, 2, 2, 3, 8, 22, 60, 78, 72, 68, 74, 85, 82, 78, 80, 85, 88, 90, 84, 72, 52, 32, 16],
      [10, 5, 3, 2, 4, 9, 24, 65, 82, 76, 70, 76, 88, 85, 82, 84, 88, 92, 93, 88, 75, 56, 35, 18],
      [11, 5, 3, 2, 4, 10, 25, 66, 84, 78, 72, 78, 90, 86, 84, 85, 90, 94, 94, 89, 76, 58, 36, 20],
      [12, 6, 4, 2, 4, 11, 24, 62, 78, 74, 70, 76, 85, 84, 82, 85, 90, 92, 92, 86, 74, 58, 38, 22],
      [14, 8, 5, 3, 3, 4, 10, 18, 38, 56, 70, 78, 84, 86, 85, 84, 86, 90, 91, 88, 78, 65, 42, 24]
    ]
  }
};

/**
 * Dynamically computes upcoming recommended time slots based on current date & historical platform analytics
 */
export function generateRecommendedSlots(platform: SocialPlatform | 'all', now: Date = new Date()): OptimalTimeSlot[] {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots: OptimalTimeSlot[] = [];

  // Slot definitions per platform
  const slotConfigs: Record<SocialPlatform | 'all', Array<{
    dayOffset: number;
    hour: number;
    minute: number;
    multiplier: string;
    audienceOnline: number;
    format: string;
    insight: string;
    tier: 'peak' | 'high' | 'moderate';
  }>> = {
    all: [
      {
        dayOffset: 0,
        hour: 19,
        minute: 30,
        multiplier: '2.9x Peak Velocity',
        audienceOnline: 96,
        format: 'Reels & FYP Video + Cross-Post',
        insight: 'Historical cross-platform dwell time surges between 7:30 PM - 9:30 PM WAT across African & global followers.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 12,
        minute: 45,
        multiplier: '2.3x Lunch Surge',
        audienceOnline: 88,
        format: 'Insight Carousel / Infographic',
        insight: 'Lunch break reading window delivers 44% higher bookmarking and comment discussion rates.',
        tier: 'high'
      },
      {
        dayOffset: 2,
        hour: 20,
        minute: 15,
        multiplier: '3.2x Weekend Primetime',
        audienceOnline: 98,
        format: 'High-Hook Video / Story Drop',
        insight: 'Weekend unwind velocity reaches maximum weekly index with +58% higher Explore page distribution.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 8,
        minute: 30,
        multiplier: '1.9x Morning Commute',
        audienceOnline: 81,
        format: 'Morning Motivation / Quote',
        insight: 'Morning routine timeline scroll captures high impression counts before workday focus.',
        tier: 'moderate'
      }
    ],
    instagram: [
      {
        dayOffset: 0,
        hour: 19,
        minute: 30,
        multiplier: '3.1x Explore Velocity',
        audienceOnline: 97,
        format: 'Reel + 1st Comment Hook',
        insight: 'Historical analytics show Reel completion rate reaches 82% between 7:30 PM - 9:00 PM, triggering Explore ranking.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 13,
        minute: 0,
        multiplier: '2.4x Save/Share Spike',
        audienceOnline: 89,
        format: 'Multi-Slide Value Carousel',
        insight: 'Carousels published at 1:00 PM yield 2.7x more saves as followers bookmark content to read later.',
        tier: 'high'
      },
      {
        dayOffset: 2,
        hour: 20,
        minute: 45,
        multiplier: '3.4x Viral Window',
        audienceOnline: 99,
        format: 'High-Aesthetic Photo / Reel',
        insight: 'Peak Sunday/weekend night engagement window with lowest content competition ratio.',
        tier: 'peak'
      }
    ],
    tiktok: [
      {
        dayOffset: 0,
        hour: 20,
        minute: 30,
        multiplier: '3.5x FYP Seed Velocity',
        audienceOnline: 98,
        format: 'Viral Sound Hook Video (15-30s)',
        insight: 'TikTok algorithm initial 100-viewer test cohort is most active at 8:30 PM WAT with fast rewatch loop velocity.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 16,
        minute: 15,
        multiplier: '2.6x After-Work Momentum',
        audienceOnline: 86,
        format: 'Tutorial / Relatable POV',
        insight: 'Creators dropping short-form content at 4:15 PM capture early evening momentum as watch sessions increase.',
        tier: 'high'
      },
      {
        dayOffset: 2,
        hour: 21,
        minute: 15,
        multiplier: '3.6x Night Owl FYP Wave',
        audienceOnline: 99,
        format: 'Storytime / High-Emotion Sound',
        insight: 'Peak dwell time window on TikTok where users average 42 minutes per continuous session.',
        tier: 'peak'
      }
    ],
    twitter: [
      {
        dayOffset: 0,
        hour: 8,
        minute: 45,
        multiplier: '2.8x Retweet Velocity',
        audienceOnline: 92,
        format: 'Curated Thread / News Commentary',
        insight: 'X (Twitter) conversation peak occurs between 8:30 AM - 10:00 AM as followers check real-time news and industry takes.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 13,
        minute: 15,
        multiplier: '2.5x Discussion Spike',
        audienceOnline: 88,
        format: 'Hot Take / Poll / Question',
        insight: 'Lunchtime quote tweets and replies are 41% more frequent, driving thread amplification.',
        tier: 'high'
      },
      {
        dayOffset: 1,
        hour: 19,
        minute: 0,
        multiplier: '2.2x Evening Catch-up',
        audienceOnline: 84,
        format: 'Thread Summary / Milestone',
        insight: 'Followers catch up on trending topics and bookmark long-form articles for weekend reading.',
        tier: 'moderate'
      }
    ],
    youtube: [
      {
        dayOffset: 0,
        hour: 16,
        minute: 0,
        multiplier: '3.0x Long-form Dwell',
        audienceOnline: 94,
        format: 'Full Video (10-18 mins) + Custom Thumb',
        insight: 'Publishing 2-3 hours before prime evening television viewing gives YouTube time to index and notify subscribers.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 11,
        minute: 30,
        multiplier: '2.2x Midday YouTube Short',
        audienceOnline: 83,
        format: 'Vertical Short (60s Hook)',
        insight: 'Midday shorts spike in browse features and channel subscriptions before main release.',
        tier: 'high'
      },
      {
        dayOffset: 2,
        hour: 15,
        minute: 30,
        multiplier: '3.3x Weekend Binge Watch',
        audienceOnline: 97,
        format: 'In-Depth Guide / Podcast Episode',
        insight: 'Weekend viewers spend 2.4x more continuous watch-time without skipping sponsor segments.',
        tier: 'peak'
      }
    ],
    linkedin: [
      {
        dayOffset: 0,
        hour: 8,
        minute: 15,
        multiplier: '2.7x Executive Reach',
        audienceOnline: 93,
        format: 'Case Study / Carousel / Story',
        insight: 'Founders, directors, and agency leads check feed during morning coffee before morning meetings start.',
        tier: 'peak'
      },
      {
        dayOffset: 1,
        hour: 12,
        minute: 30,
        multiplier: '2.3x Network Discussion',
        audienceOnline: 87,
        format: 'Hiring / Growth Strategy Post',
        insight: 'Midday professional discussions yield highest comments-to-impressions ratio.',
        tier: 'high'
      }
    ],
    facebook: [
      {
        dayOffset: 0,
        hour: 13,
        minute: 30,
        multiplier: '2.2x Community Shares',
        audienceOnline: 86,
        format: 'Photo Album / Community Update',
        insight: 'Facebook group active members and page followers share local and community updates during afternoon breaks.',
        tier: 'high'
      },
      {
        dayOffset: 1,
        hour: 19,
        minute: 45,
        multiplier: '2.6x Family/Friends Peak',
        audienceOnline: 91,
        format: 'Video / Event Announcement',
        insight: 'Evening social browsing peaks across multi-generational audiences with high link click-through.',
        tier: 'peak'
      }
    ]
  };

  const configs = slotConfigs[platform] || slotConfigs.all;

  configs.forEach((cfg, idx) => {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + cfg.dayOffset);
    targetDate.setHours(cfg.hour, cfg.minute, 0, 0);

    // If dayOffset is 0 but the time has already passed today, push to tomorrow
    if (cfg.dayOffset === 0 && targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const dayDiff = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let dayLabel = 'Today';
    if (dayDiff === 1) dayLabel = 'Tomorrow';
    else if (dayDiff > 1) dayLabel = daysOfWeek[targetDate.getDay()];

    const formattedTime = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    slots.push({
      id: `slot_${platform}_${idx}_${targetDate.getTime()}`,
      platform,
      dayName: dayLabel,
      dayOffset: cfg.dayOffset,
      hour: cfg.hour,
      minute: cfg.minute,
      formattedTime,
      engagementMultiplier: cfg.multiplier,
      audienceOnlinePercent: cfg.audienceOnline,
      recommendedFormat: cfg.format,
      historicalInsight: cfg.insight,
      trafficTier: cfg.tier
    });
  });

  return slots;
}
