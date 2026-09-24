import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  Heart,
  Share2,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react';
import {
  initialAnalyticsTimeline,
  initialPlatformBreakdown
} from '../data/initialData';
import { ConnectedAccount } from '../types';

interface AnalyticsViewProps {
  accounts: ConnectedAccount[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ accounts }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metricTab, setMetricTab] = useState<'impressions' | 'followers' | 'reach'>('impressions');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const timeline = initialAnalyticsTimeline;
  const platformStats = initialPlatformBreakdown;

  // Chart data calculations
  const values = timeline.map(t => t[metricTab]);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  // SVG Area coordinates
  const width = 700;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const points = timeline.map((d, i) => {
    const x = paddingX + (i / (timeline.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d[metricTab] - minVal) / range) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Followers,Impressions,Reach,EngagementRate\n' +
      timeline.map(e => `${e.date},${e.followers},${e.impressions},${e.reach},${e.engagementRate}%`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `really_simple_social_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Cross-Platform Growth Analytics</h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Webhook Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry aggregated across Instagram, TikTok, X, YouTube, LinkedIn, and Facebook.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  timeRange === range
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Reach</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">1.18M</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.8% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Impressions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">1.58M</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+31.2% algorithmic pickup</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Avg. Engagement</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">6.1%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top 5% creator benchmark</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Net Followers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">+54,400</div>
            <div className="text-xs text-slate-500 mt-1">
              Organic + SMM Refill Guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Growth Trajectory Timeline</h3>
            <p className="text-xs text-slate-500">Track impressions, audience gain, and algorithmic velocity</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['impressions', 'followers', 'reach'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMetricTab(tab)}
                className={`capitalize px-3 py-1 rounded-md font-medium transition ${
                  metricTab === tab
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interactive Area Chart */}
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = height - paddingY - ratio * (height - paddingY * 2);
              const labelVal = Math.round(minVal + ratio * range);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {labelVal >= 1000 ? `${Math.round(labelVal / 1000)}k` : labelVal}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGrad)" />

            {/* Primary Stroke Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Points */}
            {points.map((pt, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint === idx ? 6 : 4}
                  className="fill-white stroke-indigo-600 stroke-2 transition-all duration-150"
                />
                {/* Date Label on X Axis */}
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {pt.data.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredPoint !== null && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(points[hoveredPoint].x / width) * 100}%`,
                top: `${(points[hoveredPoint].y / height) * 100 - 15}%`
              }}
            >
              <p className="font-bold text-indigo-300">{timeline[hoveredPoint].date}</p>
              <p className="capitalize">
                {metricTab}: {timeline[hoveredPoint][metricTab].toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">
                Engagement: {timeline[hoveredPoint].engagementRate}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column: Platform Breakdown & Best Posting Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Channel Breakdown</h3>
              <p className="text-xs text-slate-500">Audience share & engagement by platform</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-4">
            {platformStats.map(p => (
              <div key={p.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <span className="font-bold text-slate-800 capitalize">{p.platform}</span>
                    <span className="text-slate-400 font-mono">({p.followers.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Eng: {p.engagement}%</span>
                    <span className="font-semibold text-emerald-600">+{p.growth}%</span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((p.followers / 300000) * 100))}%`,
                      backgroundColor: p.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Posting Time Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Optimal Posting Windows</h3>
              <p className="text-xs text-slate-500">Audience activity heatmap based on 10k+ data points</p>
            </div>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1 text-center text-[10px] font-bold text-slate-400">
              <div>Day</div>
              <div>9 AM</div>
              <div>12 PM</div>
              <div>3 PM</div>
              <div>6 PM</div>
              <div>8 PM</div>
              <div>10 PM</div>
              <div>Score</div>
            </div>

            {[
              { day: 'Mon', levels: [1, 2, 3, 4, 3, 2], peak: '6:00 PM' },
              { day: 'Tue', levels: [2, 3, 4, 5, 4, 3], peak: '6:30 PM' },
              { day: 'Wed', levels: [2, 4, 5, 5, 5, 2], peak: '3:00 PM' },
              { day: 'Thu', levels: [3, 4, 5, 5, 4, 3], peak: '8:00 PM' },
              { day: 'Fri', levels: [3, 5, 5, 4, 3, 4], peak: '12:00 PM' },
              { day: 'Sat', levels: [4, 4, 3, 4, 5, 4], peak: '8:30 PM' },
              { day: 'Sun', levels: [2, 3, 4, 5, 5, 3], peak: '7:00 PM' },
            ].map(row => (
              <div key={row.day} className="grid grid-cols-8 gap-1 items-center text-xs">
                <span className="font-bold text-slate-700 text-[11px]">{row.day}</span>
                {row.levels.map((lvl, idx) => {
                  const colors = [
                    'bg-slate-100',
                    'bg-indigo-100',
                    'bg-indigo-200',
                    'bg-indigo-400 text-white',
                    'bg-indigo-600 text-white',
                    'bg-indigo-800 text-white'
                  ];
                  return (
                    <div
                      key={idx}
                      className={`h-6 rounded flex items-center justify-center text-[9px] font-bold ${colors[lvl]}`}
                      title={`${row.day} intensity level ${lvl}/5`}
                    >
                      {lvl >= 4 ? '🔥' : ''}
                    </div>
                  );
                })}
                <span className="text-[10px] text-indigo-600 font-semibold">{row.peak}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Automated scheduler pre-calibrates to these windows.
            </span>
            <span className="font-semibold text-slate-700">Timezone: EST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
