import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Upload,
  HardDrive,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Share2,
  Send,
  RefreshCw,
  Tag
} from 'lucide-react';
import { MediaAsset } from '../types';
import { storage } from '../services/storage';

interface MediaStorageViewProps {
  assets: MediaAsset[];
  onUploadAsset: (asset: MediaAsset) => void;
  onUseAssetInPost: (assetUrl: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export const MediaStorageView: React.FC<MediaStorageViewProps> = ({
  assets,
  onUploadAsset,
  onUseAssetInPost,
  onDeleteAsset,
  onSyncCloud,
  isSyncing
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [backupNotice, setBackupNotice] = useState('');

  const totalBytes = assets.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
  const lastSync = storage.getLastSyncTime();

  const allTags = Array.from(new Set(assets.flatMap(a => a.tags)));

  const filteredAssets = assets.filter(a => {
    if (filterTag !== 'all' && !a.tags.includes(filterTag)) return false;
    if (searchQuery.trim()) {
      return (
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  const handleSimulatedUpload = (file?: File) => {
    const mockImages = [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80'
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    const name = file ? file.name : `social_asset_${Date.now().toString().slice(-4)}.jpg`;

    const newAsset: MediaAsset = {
      id: 'med_' + Date.now(),
      name,
      url: randomImg,
      type: 'image',
      sizeBytes: file ? file.size || 2150000 : 2150000,
      dimensions: '1920x1080',
      uploadedAt: new Date().toISOString(),
      tags: ['campaign', 'social', 'hq'],
      syncedToCloud: storage.isOnline()
    };

    onUploadAsset(newAsset);
    setBackupNotice('Media asset uploaded and queued in storage!');
    setTimeout(() => setBackupNotice(''), 3000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleExportJSON = () => {
    const json = storage.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `really_simple_social_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupNotice('Full database backup JSON downloaded successfully.');
    setTimeout(() => setBackupNotice(''), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const ok = storage.restoreDatabaseJSON(text);
        if (ok) {
          window.location.reload();
        } else {
          setBackupNotice('Invalid JSON backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud DB & Storage Metrics Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Cloud Database & Media Storage</h2>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Encrypted at Rest
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized asset management, offline cache synchronization, and immutable database backups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSyncCloud}
              disabled={isSyncing}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-indigo-200 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud DB'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>

        {/* Capacity & Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Storage Used</span>
              <span className="font-bold text-slate-800">{totalMB} MB / 50 GB</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: '4%' }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              IndexedDB local storage + Cloud Storage CDN
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Database Sync Protocol</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <p className="text-slate-700 font-medium mt-1">
              Last Synced: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Cloud handshake latency: 18ms
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Restore from Backup</span>
              <label className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Upload File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-slate-600 text-[11px] mt-1">
              Seamlessly restore all posts, profiles, and SMM orders from JSON.
            </p>
          </div>
        </div>
      </div>

      {backupNotice && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Drag & Drop Upload Simulator Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => handleSimulatedUpload()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-sm">
          Upload Content for Scheduled Posts
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Drag and drop images or videos here, or click to upload high-res creative assets for your multi-platform queue.
        </p>
        <span className="inline-block mt-3 text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
          JPG, PNG, MP4, WebP up to 100MB
        </span>
      </div>

      {/* Assets Grid */}
      <div className="space-y-4">
        {/* Filter tags & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterTag === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Assets ({assets.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`capitalize px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  filterTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-56"
          />
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden group hover:border-indigo-300 transition flex flex-col"
            >
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {(asset.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="font-bold text-xs text-slate-800 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {asset.tags.map(t => (
                      <span
                        key={t}
                        className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => onUseAssetInPost(asset.url)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Send className="w-3 h-3" />
                    <span>Attach to Post</span>
                  </button>

                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
