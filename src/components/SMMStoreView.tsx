import React, { useState, useMemo } from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Globe,
  SlidersHorizontal,
  Target,
  Award,
  Layers,
  Activity,
  Check,
  Filter,
  Info
} from 'lucide-react';
import { initialSMMServices } from '../data/initialData';
import { SMMService, SMMOrder } from '../types';
import confetti from 'canvas-confetti';

interface SMMStoreViewProps {
  orders: SMMOrder[];
  walletBalance: number;
  onOpenDeposit: () => void;
  onSubmitOrder: (orderData: {
    service: SMMService;
    targetLink: string;
    quantity: number;
    cost: number;
    targetRegion?: string;
    targetNiche?: string;
    deliverySpeed?: string;
    audienceQuality?: string;
  }) => boolean;
}

export const SMMStoreView: React.FC<SMMStoreViewProps> = ({
  orders,
  walletBalance,
  onOpenDeposit,
  onSubmitOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'targeted' | 'viral' | 'monetization' | 'high-retention'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<SMMService>(initialSMMServices[0]);
  const [targetLink, setTargetLink] = useState('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [orderTab, setOrderTab] = useState<'catalog' | 'orders'>('catalog');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [orderErrorMsg, setOrderErrorMsg] = useState('');

  // Customization feature states
  const [targetRegion, setTargetRegion] = useState<string>('Nigeria 🇳🇬 & West Africa');
  const [targetNiche, setTargetNiche] = useState<string>('Afrobeats, Music & Entertainment');
  const [deliverySpeed, setDeliverySpeed] = useState<string>('Algorithmic Drip-Feed (3-5 Days • Safest)');
  const [audienceTier, setAudienceTier] = useState<string>('100% Genuine Engagers (Active Bios & Feeds)');

  const services = initialSMMServices;
  const categories = ['All', 'Instagram', 'TikTok', 'YouTube', 'X/Twitter', 'LinkedIn'];

  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      if (selectedCategory !== 'All' && srv.category !== selectedCategory) return false;

      if (audienceFilter === 'targeted') {
        if (!srv.audienceType?.includes('Targeted')) return false;
      } else if (audienceFilter === 'viral') {
        if (srv.targetingTier !== 'Viral Momentum') return false;
      } else if (audienceFilter === 'monetization') {
        if (srv.targetingTier !== 'Monetization Compliant') return false;
      } else if (audienceFilter === 'high-retention') {
        if (!srv.audienceType?.includes('Retention') && srv.targetingTier !== 'Tier 1 Executive') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          srv.name.toLowerCase().includes(q) ||
          srv.description.toLowerCase().includes(q) ||
          srv.category.toLowerCase().includes(q) ||
          (srv.supportedRegions && srv.supportedRegions.some(r => r.toLowerCase().includes(q))) ||
          (srv.supportedNiches && srv.supportedNiches.some(n => n.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [services, selectedCategory, audienceFilter, searchQuery]);

  const calculatedCost = (quantity / 1000) * selectedService.ratePer1k;
  const hasSufficientBalance = walletBalance >= calculatedCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderErrorMsg('');
    setOrderSuccessMsg('');

    if (!targetLink.trim()) {
      setOrderErrorMsg('Please provide a valid social media target profile or post link.');
      return;
    }

    if (quantity < selectedService.minOrder || quantity > selectedService.maxOrder) {
      setOrderErrorMsg(
        `Quantity must be between ${selectedService.minOrder.toLocaleString()} and ${selectedService.maxOrder.toLocaleString()}.`
      );
      return;
    }

    if (!hasSufficientBalance) {
      setOrderErrorMsg(
        `Insufficient balance (₦${walletBalance.toLocaleString()}). Fund your wallet with at least ₦${(
          calculatedCost - walletBalance
        ).toLocaleString()}.`
      );
      return;
    }

    const success = onSubmitOrder({
      service: selectedService,
      targetLink: targetLink.trim(),
      quantity,
      cost: calculatedCost,
      targetRegion,
      targetNiche,
      deliverySpeed,
      audienceQuality: audienceTier
    });

    if (success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setOrderSuccessMsg(`Targeted growth campaign activated for ${targetLink.trim()}!`);
      setTargetLink('');
      setTimeout(() => setOrderSuccessMsg(''), 5000);
    }
  };

  const getPlatformBadge = (cat: string) => {
    switch (cat) {
      case 'Instagram':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TikTok':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'YouTube':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'X/Twitter':
        return 'bg-slate-900 text-slate-100 border-slate-700';
      case 'LinkedIn':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Mature Obsidian/Slate Styling */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle background mesh accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.7),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/70 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Targeted Real Audience Engine
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                Instagram • TikTok • YouTube • X
              </span>
              <span className="text-[11px] text-slate-400">Algorithmic Safety Compliance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SMM Enterprise Growth Panel
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Target genuine audiences across Nigeria, US, UK, and global creator networks. Engineered for explore-feed velocity, FYP recommendations, YouTube watch-time monetization, and high-authority X timeline engagement.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-left min-w-[170px]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Available Naira Balance</p>
              <p className="text-xl font-bold text-amber-400 font-mono tracking-tight mt-0.5">
                ₦{walletBalance.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onOpenDeposit}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-semibold px-4 py-3.5 rounded-xl transition border border-emerald-500/50 shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Fund Naira Wallet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Switcher: Create Campaign vs Active Orders */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOrderTab('catalog')}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition ${
              orderTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Services Catalog & Campaign Builder
          </button>
          <button
            onClick={() => setOrderTab('orders')}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              orderTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Active Growth Campaigns</span>
            <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            90-Day Auto-Refill Warranty
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Average Start: 15-30 mins
          </span>
        </div>
      </div>

      {orderTab === 'catalog' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Columns (7 of 12): Platform selection & Services Catalog */}
          <div className="lg:col-span-7 space-y-4">
            {/* Platform Filter Tabs & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search niche, country, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Sub-Filters for Audience Type */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                <button
                  onClick={() => setAudienceFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    audienceFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setAudienceFilter('targeted')}
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    audienceFilter === 'targeted'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>🇳🇬 Target Nigerian / Local</span>
                </button>
                <button
                  onClick={() => setAudienceFilter('viral')}
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    audienceFilter === 'viral'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>🚀 Viral FYP / Explore</span>
                </button>
                <button
                  onClick={() => setAudienceFilter('monetization')}
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    audienceFilter === 'monetization'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>⏱️ Monetization Watch Hours</span>
                </button>
                <button
                  onClick={() => setAudienceFilter('high-retention')}
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    audienceFilter === 'high-retention'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>🛡️ Tier 1 High Retention</span>
                </button>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {filteredServices.map(srv => {
                const isSelected = selectedService.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedService(srv);
                      setQuantity(Math.max(srv.minOrder, 1000));
                      if (srv.supportedRegions && srv.supportedRegions.length > 0) {
                        setTargetRegion(srv.supportedRegions[0]);
                      }
                      if (srv.supportedNiches && srv.supportedNiches.length > 0) {
                        setTargetNiche(srv.supportedNiches[0]);
                      }
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isSelected ? 'bg-slate-800 text-slate-200 border-slate-700' : getPlatformBadge(srv.category)
                          }`}
                        >
                          {srv.category}
                        </span>
                        <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {srv.name}
                        </span>
                        {srv.qualityScore && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {srv.qualityScore}% Quality Score
                          </span>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {srv.description}
                      </p>

                      {/* Supported Regions and Niches Micro-tags */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px]">
                        {srv.supportedRegions && (
                          <div className="flex items-center gap-1">
                            <Globe className={`w-3 h-3 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`} />
                            <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                              {srv.supportedRegions.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        )}
                        <span className={isSelected ? 'text-slate-600' : 'text-slate-300'}>•</span>
                        <span className={`font-medium ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          {srv.guarantee}
                        </span>
                        <span className={isSelected ? 'text-slate-600' : 'text-slate-300'}>•</span>
                        <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                          Min: {srv.minOrder.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className={`text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          Unit Rate / 1K
                        </span>
                        <p className={`text-base sm:text-lg font-bold font-mono ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                          ₦{srv.ratePer1k.toLocaleString()}
                        </p>
                      </div>
                      <button
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition mt-1.5 ${
                          isSelected
                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Configuring' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredServices.length === 0 && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                  No services matching your search or filters. Try choosing "All Types" or clearing the search query.
                </div>
              )}
            </div>
          </div>

          {/* Right Columns (5 of 12): Customized Campaign Feature & Order Placement */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-20 self-start">
              {/* Box Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                    <h3 className="font-bold text-slate-900 text-base">Campaign Customizer</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    {selectedService.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Fine-tune geotargeting, niche segmentation, and delivery pacing for {selectedService.name}.
                </p>
              </div>

              {orderSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {orderErrorMsg && (
                <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{orderErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                {/* 1. Target URL */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Target Profile or Post Link *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={`e.g., https://${selectedService.category.toLowerCase().replace('/', '')}.com/...`}
                    value={targetLink}
                    onChange={(e) => setTargetLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must be a publicly accessible profile or post.
                  </span>
                </div>

                {/* 2. Customization: Target Region / Geotargeting */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-slate-600" />
                      Target Region & Demographic
                    </label>
                    <span className="text-[10px] text-slate-500">Real Accounts</span>
                  </div>
                  <select
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="Nigeria 🇳🇬 & West Africa">Nigeria 🇳🇬 & West Africa (High Local Conversion)</option>
                    <option value="United States 🇺🇸 (Tier 1 Engagement)">United States 🇺🇸 (Tier 1 Engagement & CPM)</option>
                    <option value="United Kingdom 🇬🇧 & Europe">United Kingdom 🇬🇧 & Europe (High Retention)</option>
                    <option value="Ghana 🇬🇭 & South Africa 🇿🇦">Ghana 🇬🇭 & South Africa 🇿🇦 (Afro-Regional)</option>
                    <option value="Global Worldwide 🌍 (Broad Reach)">Global Worldwide 🌍 (Broad Distribution)</option>
                  </select>
                </div>

                {/* 3. Customization: Audience Niche Specialization */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-600" />
                      Audience Niche Specialization
                    </label>
                    <span className="text-[10px] text-slate-500">Smart Pairing</span>
                  </div>
                  <select
                    value={targetNiche}
                    onChange={(e) => setTargetNiche(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="Afrobeats, Music & Entertainment">Afrobeats, Music Artists & DJs</option>
                    <option value="Fashion, Beauty & Lifestyle">Fashion, Beauty & Lifestyle Creators</option>
                    <option value="Tech, AI, Crypto & Web3">Tech, AI, Crypto & Web3 Communities</option>
                    <option value="Comedy, Skits & Viral Content">Comedy, Skits & Viral Content Creators</option>
                    <option value="Business, Finance & Real Estate">Business, Finance & Corporate Brands</option>
                    <option value="General Organic Audiences">General High-Dwell Audiences</option>
                  </select>
                </div>

                {/* 4. Customization: Delivery Pacing / Drip Feed Mode */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      Delivery Pacing (Algorithmic Safety)
                    </label>
                    <span className="text-[10px] text-emerald-600 font-semibold">100% Drop-Safe</span>
                  </div>
                  <select
                    value={deliverySpeed}
                    onChange={(e) => setDeliverySpeed(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="Algorithmic Drip-Feed (3-5 Days • Safest)">
                      ⚡ Algorithmic Drip-Feed (3-5 Days • Safest for Explore / FYP)
                    </option>
                    <option value="Steady Daily Drip (24-48 Hours)">
                      ⏱️ Steady Daily Drip (24-48 Hours • Balanced Organic Growth)
                    </option>
                    <option value="Priority Instant Blast (0-30 Mins)">
                      🚀 Priority Instant Blast (0-30 Mins • For Live Launches)
                    </option>
                  </select>
                </div>

                {/* 5. Quantity Input & Quick Increment Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 font-semibold">Quantity</label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Min: {selectedService.minOrder.toLocaleString()} | Max: {selectedService.maxOrder.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={selectedService.minOrder}
                    max={selectedService.maxOrder}
                    step={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  {/* Quick Stepper Buttons */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[500, 1000, 2500, 5000, 10000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setQuantity(Math.min(selectedService.maxOrder, Math.max(selectedService.minOrder, val)))}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition ${
                          quantity === val
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        +{val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Algorithmic Health & Safety Simulation Card */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Algorithmic Safety Score
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {deliverySpeed.includes('3-5') ? '99.8% Perfect' : '98.5% High'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: deliverySpeed.includes('3-5') ? '99.8%' : '98.5%' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-slate-400">
                    <div>
                      <span className="block text-slate-500">Projected Retention:</span>
                      <span className="font-semibold text-slate-200">{selectedService.retentionRate || '98.2% Non-Drop'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Warranty Coverage:</span>
                      <span className="font-semibold text-emerald-400">{selectedService.guarantee}</span>
                    </div>
                  </div>
                </div>

                {/* Price Calculation Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Base Rate</span>
                    <span className="font-mono">₦{selectedService.ratePer1k.toLocaleString()} / 1,000</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Targeting Tier</span>
                    <span className="font-medium text-slate-800">{selectedService.targetingTier || 'High-Density Organic'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Total Investment</span>
                    <span className="font-bold text-slate-900 text-base font-mono">
                      ₦{calculatedCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Wallet Balance</span>
                    <span className={hasSufficientBalance ? 'text-emerald-700 font-bold font-mono' : 'text-rose-600 font-bold font-mono'}>
                      ₦{walletBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!hasSufficientBalance ? (
                  <div className="space-y-2">
                    <div className="text-rose-600 text-[11px] flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Insufficient balance. Need ₦{(calculatedCost - walletBalance).toLocaleString()} more.
                    </div>
                    <button
                      type="button"
                      onClick={onOpenDeposit}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Fund Naira Wallet</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Launch Targeted Growth (₦{calculatedCost.toLocaleString()})</span>
                  </button>
                )}

                <p className="text-[10px] text-center text-slate-400 leading-normal">
                  Protected by 60-90 Day Automated Refill Warranty. All social signals conform to natural algorithmic acceleration.
                </p>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Active Growth Campaigns View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Growth Campaigns</h3>
              <p className="text-xs text-slate-500">Live delivery monitoring, targeting status, and auto-refill guarantees</p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Non-Drop Guaranteed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map(ord => (
              <div
                key={ord.id}
                className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{ord.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlatformBadge(ord.category)}`}>
                      {ord.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{ord.serviceName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <a
                    href={ord.targetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium hover:underline flex items-center gap-1 truncate max-w-lg"
                  >
                    <span>{ord.targetLink}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  {/* Targeting parameters details */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1 flex-wrap">
                    {ord.targetRegion && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {ord.targetRegion}
                      </span>
                    )}
                    {ord.targetNiche && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <Award className="w-3 h-3 text-slate-500" />
                        {ord.targetNiche}
                      </span>
                    )}
                    {ord.deliverySpeed && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {ord.deliverySpeed.split('(')[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Quantity: <strong className="text-slate-800 font-mono">{ord.quantity.toLocaleString()}</strong></span>
                    <span>Start: <strong className="text-slate-800 font-mono">{ord.startCount.toLocaleString()}</strong></span>
                    <span>Cost: <strong className="text-slate-800 font-mono">₦{ord.cost.toLocaleString()}</strong></span>
                    <span>Placed: {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Progress bar and remaining count */}
                <div className="w-full md:w-52 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-medium">Delivery Momentum</span>
                    <span className="font-bold font-mono">
                      {ord.status === 'Completed'
                        ? '100%'
                        : `${Math.round(((ord.quantity - ord.remains) / ord.quantity) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          ord.status === 'Completed'
                            ? '100%'
                            : `${Math.round(((ord.quantity - ord.remains) / ord.quantity) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Remains: {ord.remains.toLocaleString()}</span>
                    <span className="text-emerald-600 font-medium">Refill Active</span>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs space-y-2">
                <p className="font-medium text-slate-700 text-sm">No active growth campaigns found</p>
                <p>Select an Instagram, TikTok, YouTube, or X targeted service from the catalog above to launch your first campaign.</p>
                <button
                  onClick={() => setOrderTab('catalog')}
                  className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg mt-2 inline-flex items-center gap-1"
                >
                  Explore Services Catalog <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
