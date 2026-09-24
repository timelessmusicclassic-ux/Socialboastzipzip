import React from 'react';
import {
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OfflineSyncItem } from '../types';
import { storage } from '../services/storage';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: OfflineSyncItem[];
  onSyncCloud: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  queue,
  onSyncCloud,
  isSyncing,
  lastSyncTime
}) => {
  if (!isOpen) return null;

  const isOnline = storage.isOnline();
  const isForcedOffline = storage.getForceOffline();

  const toggleOffline = () => {
    storage.setForceOffline(!isForcedOffline);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Offline Sync & Cloud Database</h3>
              <p className="text-xs text-slate-500">Local-first data management & cloud synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Connectivity Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Wifi className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <WifiOff className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-bold text-sm">
                  {isOnline ? 'Online & Cloud Connected' : 'Working Offline (Local Storage)'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isOnline
                    ? 'All transactions & schedules sync immediately.'
                    : 'Mutations are queued in local IndexedDB.'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleOffline}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition ${
                isForcedOffline
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isForcedOffline ? 'Go Online' : 'Simulate Offline'}
            </button>
          </div>

          {/* Cloud Handshake Stats */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" /> Cloud Database
              </span>
              <span className="font-semibold text-slate-800">Connected (Active)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-600" /> Pending Local Sync Queue
              </span>
              <span className={`font-bold ${queue.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {queue.length} item{queue.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Last Synchronized</span>
              <span className="font-mono text-slate-700">
                {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Queued Items List */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Queued Items Waiting for Cloud Replay</span>
              <span className="text-[10px] text-slate-400 font-normal">FIFO Sync Order</span>
            </h4>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {queue.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 capitalize">
                      {item.action} {item.type}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Queued: {new Date(item.queuedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.status}
                  </span>
                </div>
              ))}

              {queue.length === 0 && (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-slate-600 font-medium">All local changes are fully synchronized!</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    No unsaved posts, orders, or assets in queue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sync Trigger Button */}
          <button
            onClick={onSyncCloud}
            disabled={isSyncing || !isOnline}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Replaying & Synchronizing Cloud Storage...' : 'Sync Now with Cloud Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
