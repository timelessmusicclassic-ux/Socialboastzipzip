import React, { useState, useMemo } from 'react';
import {
  Zap,
  Clock,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  Activity,
  ArrowRight,
  Info,
  Check,
  Globe
} from 'lucide-react';
import { SocialPlatform, OptimalTimeSlot } from '../types';
import { platformHistoricalMatrices, generateRecommendedSlots } from '../data/engagementOptimizerData';

interface EngagementOptimizerProps {
  onSelectOptimalTime: (isoDateString: string) => void;
  selectedChannel?: string;
}

export const EngagementOptimizer: React.FC<EngagementOptimizerProps> = ({
  onSelectOptimalTime,
  selectedChannel = 'all'
}) => {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | 'all'>(
    (selectedChannel !== 'all' ? selectedChannel : 'all') as SocialPlatform | 'all'
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; score: number } | null>(null);
  const [selectedHeatSlot, setSelectedHeatSlot] = useState<{ dayIndex: number; hour: number; score: number } | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get matrix data and recommended slots
  const matrix = platformHistoricalMatrices[activePlatform] || platformHistoricalMatrices.all;
  const recommendedSlots = useMemo(() => {
    return generateRecommendedSlots(activePlatform, new Date());
  }, [activePlatform]);

  const handleApplySlot = (slot: OptimalTimeSlot) => {
    const target = new Date();
    target.setDate(target.getDate() + slot.dayOffset);
    target.setHours(slot.hour, slot.minute, 0, 0);

    // If time is in the past for today, push to tomorrow
    if (slot.dayOffset === 0 && target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }

    // Format as YYYY-MM-DDTHH:mm
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hoursStr = String(target.getHours()).padStart(2, '0');
    const minutesStr = String(target.getMinutes()).padStart(2, '0');

    const formattedIso = `${year}-${month}-${day}T${hoursStr}:${minutesStr}`;
    onSelectOptimalTime(formattedIso);
  };

  const handleApplyHeatSlot = () => {
    if (!selectedHeatSlot) return;
    const now = new Date();
    const currentDay = now.getDay();
    let dayDiff = selectedHeatSlot.dayIndex - currentDay;
    if (dayDiff < 0) dayDiff += 7;
    if (dayDiff === 0 && selectedHeatSlot.hour <= now.getHours()) {
      dayDiff = 7; // schedule for next week if today's hour has passed
    }

    const target = new Date(now);
    target.setDate(now.getDate() + dayDiff);
    target.setHours(selectedHeatSlot.hour, 0, 0, 0);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hoursStr = String(target.getHours()).padStart(2, '0');

    const formattedIso = `${year}-${month}-${day}T${hoursStr}:00`;
    onSelectOptimalTime(formattedIso);
  };

  const getIntensityColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 75) return 'bg-emerald-600/70 text-white';
    if (score >= 50) return 'bg-slate-700 text-slate-200';
    if (score >= 25) return 'bg-slate-800 text-slate-400';
    return 'bg-slate-900/60 text-slate-600';
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Widget Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/60 via-slate-900 to-slate-950">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Engagement Optimizer
            </span>
            <span className="text-xs text-slate-400">Algorithmic Peak Timing Model</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded">
              +{matrix.averageLiftPercent}% Avg Reach Surge
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Predictive Best Time to Post
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Derived from 30-day historical account dwell time, viral explore acceleration, and follower activity curves across African & international audiences.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <button
            onClick={() => handleApplySlot(recommendedSlots[0])}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-md border border-emerald-500/40 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Schedule Top Slot</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={isExpanded ? 'Collapse widget' : 'Expand widget'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Platform Channel Selectors */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Channels' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'twitter', label: 'X (Twitter)' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'facebook', label: 'Facebook' }
                ] as const
              ).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActivePlatform(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activePlatform === item.id
                      ? 'bg-white text-slate-900 shadow-md font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
              <span className="flex items-center gap-1 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Timezone: Africa/Lagos (WAT / GMT+1)
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-medium">Best Days: {matrix.bestDay}</span>
            </div>
          </div>

          {/* Recommended Optimal Slots Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Time Slots for {activePlatform === 'all' ? 'All Channels' : activePlatform.toUpperCase()}
              </h4>
              <span className="text-[11px] text-slate-400">Click any card to schedule immediately</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recommendedSlots.map((slot, idx) => (
                <div
                  key={slot.id}
                  onClick={() => handleApplySlot(slot)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between group ${
                    idx === 0
                      ? 'bg-slate-800/90 hover:bg-slate-800 border-amber-500/40 ring-1 ring-amber-500/20 shadow-md'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {slot.dayName} • {slot.formattedTime}
                        </span>
                        {idx === 0 && (
                          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            #1 Top Window
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          slot.trafficTier === 'peak'
                            ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                            : slot.trafficTier === 'high'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                            : 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                        }`}
                      >
                        {slot.trafficTier.toUpperCase()} VELOCITY
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <TrendingUp className="w-3 h-3" />
                        {slot.engagementMultiplier}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 font-mono">
                        {slot.audienceOnlinePercent}% Audience Online
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {slot.historicalInsight}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[180px]">
                      Format: <strong className="text-slate-200 font-normal">{slot.recommendedFormat}</strong>
                    </span>
                    <span className="text-emerald-400 group-hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 transition">
                      Schedule <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Historical Audience Density Heatmap */}
          <div className="bg-slate-950/70 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  7-Day × 24-Hour Historical Activity Heatmap
                </h4>
                <p className="text-[11px] text-slate-400">
                  Darkest slate = Off-peak • Vibrant Emerald = Maximum engagement index (90-100%)
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>Low</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-slate-900/60 border border-slate-800"></span>
                  <span className="w-3 h-3 rounded-xs bg-slate-800"></span>
                  <span className="w-3 h-3 rounded-xs bg-slate-700"></span>
                  <span className="w-3 h-3 rounded-xs bg-emerald-700"></span>
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                </div>
                <span>Peak</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-1 scrollbar-none">
              <div className="min-w-[620px] space-y-1">
                {/* Hour Header labels */}
                <div className="grid grid-cols-25 gap-1 text-[9px] text-slate-400 font-mono text-center pb-1">
                  <div className="w-8 text-left">Day</div>
                  {hours.map(h => (
                    <div key={h} className="truncate">
                      {h === 0 ? '12a' : h === 6 ? '6a' : h === 12 ? '12p' : h === 18 ? '6p' : h === 21 ? '9p' : ''}
                    </div>
                  ))}
                </div>

                {/* Days Rows */}
                {daysOfWeek.map((d, dIdx) => (
                  <div key={d} className="grid grid-cols-25 gap-1 items-center">
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-left">
                      {d}
                    </span>
                    {hours.map(h => {
                      const score = matrix.heatGrid[dIdx]?.[h] || 15;
                      const isSelected =
                        selectedHeatSlot?.dayIndex === dIdx && selectedHeatSlot?.hour === h;

                      return (
                        <div
                          key={h}
                          onMouseEnter={() => setHoveredCell({ day: fullDays[dIdx], hour: h, score })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setSelectedHeatSlot({ dayIndex: dIdx, hour: h, score })}
                          title={`${fullDays[dIdx]} at ${h}:00 - Historical Score: ${score}%`}
                          className={`h-5 rounded-xs transition-all cursor-pointer ${getIntensityColor(score)} ${
                            isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Cell Inspection Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="text-slate-300 text-[11px] flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                {hoveredCell ? (
                  <span>
                    Selected: <strong className="text-white">{hoveredCell.day} at {hoveredCell.hour}:00</strong> — Engagement Density:{' '}
                    <strong className="text-emerald-400 font-mono">{hoveredCell.score}%</strong>
                  </span>
                ) : selectedHeatSlot ? (
                  <span>
                    Chosen slot: <strong className="text-white">{fullDays[selectedHeatSlot.dayIndex]} at {selectedHeatSlot.hour}:00</strong> ({selectedHeatSlot.score}% Density)
                  </span>
                ) : (
                  <span>Hover or click any time block on the heatmap to inspect hourly audience density.</span>
                )}
              </div>

              {selectedHeatSlot && (
                <button
                  onClick={handleApplyHeatSlot}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule for {fullDays[selectedHeatSlot.dayIndex]} {selectedHeatSlot.hour}:00</span>
                </button>
              )}
            </div>
          </div>

          {/* Strategic Platform Insights Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <Flame className="w-3.5 h-3.5" />
                Pacing Recommendation
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Allow at least 3.5 to 4 hours between consecutive posts to prevent algorithmic reach cannibalization.
              </p>
            </div>

            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <Globe className="w-3.5 h-3.5" />
                Peak Geographies
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Strongest concurrent overlap occurs between Lagos (WAT), London (GMT), and New York (EST afternoon).
              </p>
            </div>

            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                Early Velocity Rule
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                First 45 minutes of post life dictate 70% of total 48-hour distribution on Instagram & TikTok FYP.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
