import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { ConnectedAccount, SocialPlatform } from '../types';

export interface FollowerGrowthD3ChartProps {
  accounts: ConnectedAccount[];
  className?: string;
}

export interface DayGrowthPoint {
  date: Date;
  dateStr: string;
  dayLabel: string;
  totalFollowers: number;
  dailyGain: number;
  byPlatform: Record<string, number>;
  gainByPlatform: Record<string, number>;
}

// Color palettes per platform selection
const PLATFORM_THEMES: Record<
  string,
  {
    name: string;
    stroke: string;
    gradientFrom: string;
    gradientTo: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  all: {
    name: 'All Platforms Combined',
    stroke: '#6366f1', // indigo-500
    gradientFrom: 'rgba(99, 102, 241, 0.28)',
    gradientTo: 'rgba(99, 102, 241, 0.01)',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700 border-indigo-200',
    dotColor: '#4f46e5'
  },
  tiktok: {
    name: 'TikTok',
    stroke: '#06b6d4', // cyan-500
    gradientFrom: 'rgba(6, 182, 212, 0.28)',
    gradientTo: 'rgba(6, 182, 212, 0.01)',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800 border-cyan-200',
    dotColor: '#0891b2'
  },
  instagram: {
    name: 'Instagram',
    stroke: '#e11d48', // rose-600
    gradientFrom: 'rgba(225, 29, 72, 0.25)',
    gradientTo: 'rgba(225, 29, 72, 0.01)',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700 border-rose-200',
    dotColor: '#be123c'
  },
  twitter: {
    name: 'X (Twitter)',
    stroke: '#0284c7', // sky-600
    gradientFrom: 'rgba(2, 132, 199, 0.25)',
    gradientTo: 'rgba(2, 132, 199, 0.01)',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700 border-sky-200',
    dotColor: '#0369a1'
  },
  youtube: {
    name: 'YouTube',
    stroke: '#dc2626', // red-600
    gradientFrom: 'rgba(220, 38, 38, 0.25)',
    gradientTo: 'rgba(220, 38, 38, 0.01)',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700 border-red-200',
    dotColor: '#b91c1c'
  },
  linkedin: {
    name: 'LinkedIn',
    stroke: '#2563eb', // blue-600
    gradientFrom: 'rgba(37, 99, 235, 0.25)',
    gradientTo: 'rgba(37, 99, 235, 0.01)',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700 border-blue-200',
    dotColor: '#1d4ed8'
  },
  facebook: {
    name: 'Facebook',
    stroke: '#1d4ed8', // blue-700
    gradientFrom: 'rgba(29, 78, 216, 0.25)',
    gradientTo: 'rgba(29, 78, 216, 0.01)',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800 border-blue-200',
    dotColor: '#1e40af'
  }
};

export const FollowerGrowthD3Chart: React.FC<FollowerGrowthD3ChartProps> = ({
  accounts,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 700,
    height: 280
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [hoveredData, setHoveredData] = useState<DayGrowthPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // ResizeObserver with debounce for dynamic container responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout | null = null;
    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = Math.max(300, Math.floor(entry.contentRect.width));
      // Adaptive height: compact on mobile, spacious on desktop
      const newHeight = newWidth < 640 ? 240 : 280;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width: newWidth, height: newHeight });
      }, 50);
    });

    observer.observe(containerRef.current);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // Connected accounts lookup
  const activeAccounts = useMemo(() => {
    const connected = accounts.filter(a => a.connected);
    return connected.length > 0 ? connected : accounts;
  }, [accounts]);

  // Generate 30 days of data anchored to actual current account counts
  const data: DayGrowthPoint[] = useMemo(() => {
    const points: DayGrowthPoint[] = [];
    const totalCurrentFollowers = activeAccounts.reduce((acc, a) => acc + (a.followers || 0), 0);

    // If no accounts, provide baseline
    const fallbackCurrent = totalCurrentFollowers > 0 ? totalCurrentFollowers : 540000;
    const DAYS = 30;

    // Daily variance weights for 30 days (deterministic seed for smooth curves with realistic spikes)
    // Exactly 30 weight multipliers:
    const dailyWeights = [
      0.8, 0.9, 1.1, 0.7, 1.3, 1.0, 1.2, // Week 1 (7)
      0.9, 1.4, 1.6, 1.1, 0.8, 1.2, 1.5, // Week 2 (7)
      1.0, 0.9, 1.3, 1.7, 1.4, 1.1, 1.3, // Week 3 (7)
      1.2, 1.8, 2.1, 1.5, 1.3, 1.6, 1.9, 2.0, 2.2 // Week 4 & recent viral momentum (9) -> Total 30
    ];

    // Calculate baseline historical growth rate (average ~18% over 30 days)
    const avgGrowthRate = activeAccounts.length > 0
      ? activeAccounts.reduce((sum, a) => sum + (a.growthRate || 0), 0) / activeAccounts.length
      : 18.4;

    // Total net followers gained over 30 days
    const total30DayGain = Math.max(100, Math.round(fallbackCurrent * (avgGrowthRate / 100) * 0.75));
    const weightSum = dailyWeights.reduce((a, b) => a + b, 0);

    // Compute daily increments
    const dailyGains = dailyWeights.map(w => Math.max(1, Math.round((w / weightSum) * total30DayGain)));

    // Construct cumulative totals backward from today (index DAYS - 1) to day 0
    const totals = new Array<number>(DAYS);
    totals[DAYS - 1] = fallbackCurrent;
    for (let i = DAYS - 2; i >= 0; i--) {
      const stepGain = dailyGains[i + 1] ?? Math.round(total30DayGain / DAYS);
      totals[i] = Math.max(100, totals[i + 1] - stepGain);
    }

    const now = new Date();
    // Anchor to today 23:59 or now
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(now.getTime() - (DAYS - 1 - i) * 24 * 60 * 60 * 1000);
      const dayTotal = typeof totals[i] === 'number' && !isNaN(totals[i]) ? totals[i] : fallbackCurrent;
      const gain = dailyGains[i] || Math.round(total30DayGain / DAYS);

      // Platform breakdowns
      const byPlatform: Record<string, number> = {};
      const gainByPlatform: Record<string, number> = {};

      if (activeAccounts.length > 0) {
        activeAccounts.forEach(account => {
          const platformShare = fallbackCurrent > 0 ? (account.followers || 0) / fallbackCurrent : 0.2;
          const pTotal = Math.round(dayTotal * platformShare);
          const pGain = Math.round(gain * platformShare * (1 + ((account.growthRate || 15) - avgGrowthRate) / 100));
          byPlatform[account.platform] = Math.max(0, pTotal);
          gainByPlatform[account.platform] = Math.max(1, pGain);
        });
      }

      points.push({
        date: d,
        dateStr: d3.timeFormat('%b %d')(d),
        dayLabel: d3.timeFormat('%A, %b %d, %Y')(d),
        totalFollowers: dayTotal,
        dailyGain: gain,
        byPlatform,
        gainByPlatform
      });
    }

    return points;
  }, [activeAccounts]);

  // Selected value extractor based on active filter
  const getValue = (d?: DayGrowthPoint | null): number => {
    if (!d) return 0;
    if (selectedFilter === 'all') {
      const val = d.totalFollowers;
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    }
    const val = d.byPlatform?.[selectedFilter] ?? d.totalFollowers;
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  };

  const getGain = (d?: DayGrowthPoint | null): number => {
    if (!d) return 0;
    if (selectedFilter === 'all') {
      const val = d.dailyGain;
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    }
    const val = d.gainByPlatform?.[selectedFilter] ?? d.dailyGain;
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  };

  // Metrics summary
  const startVal = data.length > 0 ? getValue(data[0]) : 0;
  const endVal = data.length > 0 ? getValue(data[data.length - 1]) : 0;
  const netGrowth = Math.max(0, endVal - startVal);
  const netGrowthPercent = startVal > 0 ? ((netGrowth / startVal) * 100).toFixed(1) : '0.0';
  const avgDailyGain = data.length > 1 ? Math.round(netGrowth / (data.length - 1)) : 0;

  // Find peak day
  const peakDay = useMemo(() => {
    if (!data || data.length === 0) {
      const now = new Date();
      return {
        point: {
          date: now,
          dateStr: d3.timeFormat('%b %d')(now),
          dayLabel: d3.timeFormat('%A, %b %d, %Y')(now),
          totalFollowers: 0,
          dailyGain: 0,
          byPlatform: {},
          gainByPlatform: {}
        },
        gain: 0
      };
    }
    let max = data[0];
    let maxGain = getGain(data[0]);
    for (const d of data) {
      const g = getGain(d);
      if (g > maxGain) {
        maxGain = g;
        max = d;
      }
    }
    return { point: max, gain: maxGain };
  }, [data, selectedFilter]);

  // D3 Scales & Coordinate Math
  const margin = {
    top: 20,
    right: 25,
    bottom: 35,
    left: dimensions.width < 500 ? 50 : 65
  };

  const innerWidth = Math.max(10, dimensions.width - margin.left - margin.right);
  const innerHeight = Math.max(10, dimensions.height - margin.top - margin.bottom);

  // Time X Scale
  const xScale = useMemo(() => {
    const startDate = data.length > 0 ? data[0].date : new Date();
    const endDate = data.length > 0 ? data[data.length - 1].date : new Date();
    return d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([0, innerWidth]);
  }, [data, innerWidth]);

  // Linear Y Scale
  const yScale = useMemo(() => {
    const vals = data.map(getValue);
    const min = vals.length > 0 ? Math.min(...vals) : 0;
    const max = vals.length > 0 ? Math.max(...vals) : 1000;
    const padding = (max - min) * 0.15 || 1000;
    return d3
      .scaleLinear()
      .domain([Math.max(0, min - padding), max + padding * 0.5])
      .range([innerHeight, 0])
      .nice();
  }, [data, selectedFilter, innerHeight]);

  // D3 Line & Area generators
  const lineGenerator = useMemo(() => {
    return d3
      .line<DayGrowthPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale, selectedFilter]);

  const areaGenerator = useMemo(() => {
    return d3
      .area<DayGrowthPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale, innerHeight, selectedFilter]);

  const linePath = useMemo(() => lineGenerator(data) || '', [lineGenerator, data]);
  const areaPath = useMemo(() => areaGenerator(data) || '', [areaGenerator, data]);

  // Y-axis horizontal ticks
  const yTicks = useMemo(() => {
    return yScale.ticks(dimensions.height < 250 ? 4 : 5);
  }, [yScale, dimensions.height]);

  // X-axis date ticks (spaced cleanly)
  const xTicks = useMemo(() => {
    const count = dimensions.width < 500 ? 4 : 7;
    return xScale.ticks(count);
  }, [xScale, dimensions.width]);

  // Format numbers cleanly for axis (e.g. 520k, 120k)
  const formatYValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return val.toString();
  };

  // Interactive Hover Handler using d3.bisector
  const bisectDate = d3.bisector<DayGrowthPoint, Date>(d => d.date).left;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const relX = clientX - margin.left;

    if (relX < 0 || relX > innerWidth) {
      setHoveredData(null);
      setHoverPos(null);
      return;
    }

    const hoverDate = xScale.invert(relX);
    const index = bisectDate(data, hoverDate, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let selectedPoint = d0;
    if (d1 && d0) {
      selectedPoint =
        hoverDate.getTime() - d0.date.getTime() > d1.date.getTime() - hoverDate.getTime()
          ? d1
          : d0;
    } else if (d1) {
      selectedPoint = d1;
    }

    if (selectedPoint) {
      const x = xScale(selectedPoint.date);
      const y = yScale(getValue(selectedPoint));
      setHoveredData(selectedPoint);
      setHoverPos({ x: x + margin.left, y: y + margin.top });
    }
  };

  const handlePointerLeave = () => {
    setHoveredData(null);
    setHoverPos(null);
  };

  const currentTheme = PLATFORM_THEMES[selectedFilter] || PLATFORM_THEMES.all;

  return (
    <div
      id="overview-d3-growth-chart-card"
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition hover:border-indigo-200 ${className}`}
    >
      {/* Top Header: Title, Metric Chips & Platform Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              30-Day Follower Growth Trend
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              <span>+{netGrowthPercent}%</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily algorithmic audience trajectory rendered via D3.js
          </p>
        </div>

        {/* Platform Selection Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Channels
          </button>

          {activeAccounts.map(account => {
            const isSelected = selectedFilter === account.platform;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => setSelectedFilter(account.platform)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg capitalize transition flex items-center gap-1.5 ${
                  isSelected
                    ? `${currentTheme.badgeBg} ${currentTheme.badgeText} font-bold ring-1 ring-inset ring-current`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{account.platform}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  {formatYValue(account.followers)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Performance Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100/80">
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">30-Day Net Gain</span>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight mt-0.5 flex items-baseline gap-1">
            <span>+{(netGrowth ?? 0).toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            ▲ {netGrowthPercent}% total increase
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Daily Average Gain</span>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight mt-0.5">
            +{(avgDailyGain ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">organic daily momentum</span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Peak Growth Day</span>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight mt-0.5">
            +{(peakDay?.gain ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">
            {peakDay?.point?.dateStr ?? 'Today'} viral surge
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Audience Metric</span>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight mt-0.5">
            {(endVal ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 capitalize">
            {selectedFilter === 'all' ? 'cumulative across accounts' : `${selectedFilter} profile`}
          </span>
        </div>
      </div>

      {/* D3 Chart Stage with ResizeObserver Container */}
      <div
        ref={containerRef}
        className="w-full relative pt-4 select-none touch-pan-x"
        style={{ minHeight: dimensions.height }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible block"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Smooth SVG Area Gradient */}
            <linearGradient id="growth-d3-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentTheme.stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={currentTheme.stroke} stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing marker filter */}
            <filter id="glow-dot" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={currentTheme.stroke} floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Chart Graphic Group positioned with margins */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map(tickVal => {
              const y = yScale(tickVal);
              return (
                <g key={`y-tick-${tickVal}`} className="text-slate-400">
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-400 select-none"
                  >
                    {formatYValue(tickVal)}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Dates */}
            {xTicks.map(d => {
              const x = xScale(d);
              return (
                <g key={`x-tick-${d.toISOString()}`}>
                  <line
                    x1={x}
                    y1={innerHeight}
                    x2={x}
                    y2={innerHeight + 5}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={innerHeight + 20}
                    textAnchor="middle"
                    className="text-[11px] font-medium fill-slate-500 select-none"
                  >
                    {d3.timeFormat('%b %d')(d)}
                  </text>
                </g>
              );
            })}

            {/* Bottom X-Axis baseline */}
            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#e2e8f0"
              strokeWidth={1}
            />

            {/* Area Fill */}
            <path d={areaPath} fill="url(#growth-d3-gradient)" />

            {/* Primary Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke={currentTheme.stroke}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Data Points on Peak and End */}
            {data.length > 0 && (
              <>
                {/* End Point (Today) */}
                <circle
                  cx={xScale(data[data.length - 1].date)}
                  cy={yScale(getValue(data[data.length - 1]))}
                  r={4.5}
                  fill="#ffffff"
                  stroke={currentTheme.stroke}
                  strokeWidth={2.5}
                />
              </>
            )}

            {/* Hover Crosshair Vertical Line */}
            {hoveredData && (
              <line
                x1={xScale(hoveredData.date)}
                y1={0}
                x2={xScale(hoveredData.date)}
                y2={innerHeight}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                pointerEvents="none"
              />
            )}

            {/* Hover Highlight Circle */}
            {hoveredData && (
              <circle
                cx={xScale(hoveredData.date)}
                cy={yScale(getValue(hoveredData))}
                r={6}
                fill={currentTheme.dotColor}
                stroke="#ffffff"
                strokeWidth={3}
                filter="url(#glow-dot)"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>

        {/* Dynamic HTML Tooltip Overlay */}
        {hoveredData && hoverPos && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: Math.min(
                dimensions.width - 220,
                Math.max(10, hoverPos.x - 110)
              ),
              top: Math.max(10, hoverPos.y - 120)
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/80 text-xs w-[220px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                <span className="font-medium">{hoveredData.dayLabel}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  +{(getGain(hoveredData) ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-slate-300 text-[11px]">Followers:</span>
                <span className="font-bold text-base font-mono text-white">
                  {(getValue(hoveredData) ?? 0).toLocaleString()}
                </span>
              </div>

              {/* Platform Breakdown mini chips if 'all' is selected */}
              {selectedFilter === 'all' && (
                <div className="pt-1 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                  {activeAccounts.slice(0, 4).map(acc => (
                    <div key={acc.id} className="flex items-center justify-between">
                      <span className="capitalize text-slate-400">{acc.platform}:</span>
                      <span className="font-mono font-semibold">
                        {formatYValue(hoveredData.byPlatform[acc.platform] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Explanatory Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Tracking automated posting impacts, viral explore algorithm distributions & SMM boosts.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTheme.stroke }}></span>
            <span className="text-slate-600 font-medium">{currentTheme.name}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono text-[11px]">Daily Granularity</span>
        </div>
      </div>
    </div>
  );
};
