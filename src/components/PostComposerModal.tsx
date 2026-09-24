import React, { useState } from 'react';
import {
  X,
  Send,
  Calendar,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Check,
  Zap,
  Globe,
  Tag,
  AlertCircle
} from 'lucide-react';
import { SocialPlatform, ScheduledPost, MediaAsset } from '../types';
import confetti from 'canvas-confetti';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: ScheduledPost) => void;
  assets: MediaAsset[];
  initialDate?: string;
  initialMediaUrl?: string;
}

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
  assets,
  initialDate,
  initialMediaUrl
}) => {
  if (!isOpen) return null;

  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['instagram', 'tiktok', 'twitter']);
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>(initialMediaUrl ? [initialMediaUrl] : []);
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialDate || new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString().slice(0, 16)
  );
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>('instagram');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const platformOptions: { id: SocialPlatform; label: string; limit: number }[] = [
    { id: 'instagram', label: 'Instagram', limit: 2200 },
    { id: 'tiktok', label: 'TikTok', limit: 2200 },
    { id: 'twitter', label: 'X (Twitter)', limit: 280 },
    { id: 'youtube', label: 'YouTube Community', limit: 5000 },
    { id: 'linkedin', label: 'LinkedIn', limit: 3000 },
    { id: 'facebook', label: 'Facebook', limit: 5000 }
  ];

  const suggestedHashtags = [
    '#ReallySimpleSocial',
    '#GrowthHacks',
    '#CreatorEconomy',
    '#ContentStrategy',
    '#AlgorithmTips',
    '#ViralShorts'
  ];

  const togglePlatform = (p: SocialPlatform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(item => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const addHashtag = (tag: string) => {
    if (!content.includes(tag)) {
      setContent(prev => (prev ? `${prev.trim()} ${tag}` : tag));
    }
  };

  const handleGenerateAICaption = () => {
    const hooks = [
      "Stop scrolling if you want to double your social retention this week 📈 Here's the exact framework we used across our top 5 accounts: ",
      "The #1 mistake most creators make when scheduling content? Not optimizing for the first 30-minute velocity window. Here is the fix: ",
      "Behind the scenes of scaling our multi-channel audience to 500k+ followers with automated cloud scheduling. 🚀 Drop your questions below!"
    ];
    const picked = hooks[Math.floor(Math.random() * hooks.length)];
    setContent(picked);
  };

  const handleSchedule = (immediate: boolean = false) => {
    if (!content.trim()) return;

    const newPost: ScheduledPost = {
      id: 'post_' + Date.now(),
      platforms,
      content: content.trim(),
      mediaUrls: selectedMedia,
      scheduledAt: immediate ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
      status: immediate ? 'published' : 'scheduled',
      createdAt: new Date().toISOString(),
      tags: content.match(/#[a-zA-Z0-9_]+/g) || ['scheduled'],
      engagementEstimate: {
        predictedReach: Math.floor(Math.random() * 30000) + 15000,
        predictedLikes: Math.floor(Math.random() * 2500) + 1200,
        predictedComments: Math.floor(Math.random() * 200) + 80
      },
      syncedToCloud: false // Will be determined by storage service
    };

    onSavePost(newPost);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onClose();
  };

  const currentPlatformLimit =
    platformOptions.find(p => p.id === previewPlatform)?.limit || 2200;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Schedule New Social Post</h3>
              <p className="text-xs text-slate-500">Auto-publishes across selected social channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column: Editor Controls (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-4 text-xs">
            {/* Platform Selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Target Channels *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {platformOptions.map(opt => {
                  const isSelected = platforms.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => togglePlatform(opt.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold">Post Content</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAICaption}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Draft Hook
                  </button>
                  <span className={`${content.length > currentPlatformLimit ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                    {content.length} / {currentPlatformLimit}
                  </span>
                </div>
              </div>

              <textarea
                rows={5}
                placeholder="What valuable content or story are you sharing today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              ></textarea>
            </div>

            {/* Hashtag Suggestions */}
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-1 text-[11px] font-medium">
                <Tag className="w-3 h-3" /> Trending Hashtags:
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestedHashtags.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addHashtag(t)}
                    className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Attachment Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold">Media Attachment</label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                  className="text-indigo-600 hover:underline text-[11px] font-medium"
                >
                  {showMediaPicker ? 'Hide Media Picker' : 'Choose from Cloud Media Library'}
                </button>
              </div>

              {selectedMedia.length > 0 ? (
                <div className="relative inline-block">
                  <img
                    src={selectedMedia[0]}
                    alt="Selected attachment"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedMedia([])}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full border border-dashed border-slate-300 rounded-xl py-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                  <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                  <span>Attach Image or Video from Cloud Storage</span>
                </button>
              )}

              {/* Cloud Media Picker Tray */}
              {showMediaPicker && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">Click an asset to attach:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {assets.map(asset => (
                      <img
                        key={asset.id}
                        src={asset.url}
                        alt={asset.name}
                        onClick={() => {
                          setSelectedMedia([asset.url]);
                          setShowMediaPicker(false);
                        }}
                        className="w-full h-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scheduled Datetime */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Automated Publish Date & Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setHours(d.getHours() + 3);
                    setScheduledAt(d.toISOString().slice(0, 16));
                  }}
                  className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-700"
                >
                  Peak +3h
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mock Post Preview (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between text-xs space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900">Live Preview</span>
                {/* Platform Preview Selector */}
                <div className="flex items-center gap-1">
                  {platforms.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreviewPlatform(p)}
                      className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                        previewPlatform === p
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Realistic Social Card Preview */}
              <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Really Simple Social</p>
                    <p className="text-[10px] text-slate-400">@reallysimplesocial • Just now</p>
                  </div>
                </div>

                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">
                  {content || 'Your post caption will be rendered here with live hashtags and links.'}
                </p>

                {selectedMedia.length > 0 && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-slate-100">
                    <img
                      src={selectedMedia[0]}
                      alt="Preview attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400 text-[11px]">
                  <span>❤️ 1,240</span>
                  <span>💬 84 comments</span>
                  <span>🔄 320 shares</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => handleSchedule(false)}
                disabled={!content.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule for Auto-Publish</span>
              </button>

              <button
                type="button"
                onClick={() => handleSchedule(true)}
                disabled={!content.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Publish Immediately</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
