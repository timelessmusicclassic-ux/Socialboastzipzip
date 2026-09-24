import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  Plus,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Share2,
  Filter,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  CloudOff,
  CloudCheck
} from 'lucide-react';
import { ScheduledPost, SocialPlatform } from '../types';
import { EngagementOptimizer } from './EngagementOptimizer';

interface PostSchedulerViewProps {
  posts: ScheduledPost[];
  onOpenComposer: (initialDate?: string) => void;
  onPublishNow: (post: ScheduledPost) => void;
  onDeletePost: (postId: string) => void;
  onBoostPost: (post: ScheduledPost) => void;
}

export const PostSchedulerView: React.FC<PostSchedulerViewProps> = ({
  posts,
  onOpenComposer,
  onPublishNow,
  onDeletePost,
  onBoostPost
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const filteredPosts = posts.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (selectedPlatform !== 'all' && !post.platforms.includes(selectedPlatform as SocialPlatform)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays, year, month };
  };

  const { firstDay, totalDays, year, month } = getDaysInMonth(currentCalendarMonth);
  const monthName = currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentCalendarMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentCalendarMonth(new Date(year, month + 1, 1));
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const pDate = new Date(post.scheduledAt);
      return (
        pDate.getFullYear() === year &&
        pDate.getMonth() === month &&
        pDate.getDate() === day
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Scheduling Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Automated Post Scheduler</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
              Auto-Queue Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish seamlessly across Instagram, TikTok, X, YouTube, LinkedIn & Facebook with automated cloud sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Queue List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => onOpenComposer()}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Engagement Optimizer Widget */}
      <EngagementOptimizer
        onSelectOptimalTime={(slotIsoTime) => onOpenComposer(slotIsoTime)}
        selectedChannel={selectedPlatform}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['all', 'scheduled', 'published', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`capitalize px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status} {status !== 'all' && `(${posts.filter(p => p.status === status).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Platform selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search posts or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* View Mode: List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition p-5 flex flex-col md:flex-row gap-5 items-start justify-between"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {post.mediaUrls.length > 0 ? (
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <Send className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] mt-1">Text Post</span>
                  </div>
                )}

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Platform pills */}
                    {post.platforms.map(p => (
                      <span
                        key={p}
                        className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase"
                      >
                        {p}
                      </span>
                    ))}

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {post.status}
                    </span>

                    {/* Cloud sync status */}
                    {post.syncedToCloud ? (
                      <span className="text-emerald-600 text-[10px] font-medium flex items-center gap-0.5">
                        <CloudCheck className="w-3 h-3" /> Cloud Synced
                      </span>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-medium flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <CloudOff className="w-3 h-3" /> Local Offline Stored
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* Scheduled time & metrics */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {post.status === 'published' ? 'Published on' : 'Scheduled for'}:{' '}
                        {new Date(post.scheduledAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {post.engagementEstimate && (
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>Est. Reach: ~{post.engagementEstimate.predictedReach.toLocaleString()}</span>
                        <span>Est. Likes: ~{post.engagementEstimate.predictedLikes.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                {post.status !== 'published' && (
                  <button
                    onClick={() => onPublishNow(post)}
                    title="Publish immediately across all selected platforms"
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                )}

                <button
                  onClick={() => onBoostPost(post)}
                  title="Boost post engagement with Really Simple Social SMM services"
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Boost</span>
                </button>

                <button
                  onClick={() => onDeletePost(post.id)}
                  title="Remove post"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Posts Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No posts match the current filter. Create a new automated scheduled post to fill your calendar.
              </p>
              <button
                onClick={() => onOpenComposer()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule New Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Mode: Calendar */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarMonth(new Date())}
                className="text-xs font-semibold px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/50 rounded-xl p-2 border border-dashed border-slate-200/50"></div>
            ))}

            {/* Actual Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dayPosts = getPostsForDay(dayNum);
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    const dateStr = new Date(year, month, dayNum, 12, 0).toISOString();
                    onOpenComposer(dateStr);
                  }}
                  className={`min-h-[100px] rounded-xl p-2 border transition cursor-pointer flex flex-col justify-between group ${
                    isToday
                      ? 'bg-indigo-50/30 border-indigo-300 ring-1 ring-indigo-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold transition">
                      + Add
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px] scrollbar-none">
                    {dayPosts.map(p => (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPublishNow(p);
                        }}
                        className={`text-[10px] p-1 rounded font-medium truncate flex items-center gap-1 ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                        title={`${p.platforms.join(', ')}: ${p.content}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        <span className="truncate">{p.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
