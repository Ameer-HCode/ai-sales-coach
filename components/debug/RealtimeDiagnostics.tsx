import React, { useState } from 'react';
import { Activity, Clock, Server, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Diagnostics } from '@/components/audio/useAudioStream';

interface RealtimeDiagnosticsProps {
    stats: Diagnostics;
    mode: 'stereo' | 'mono';
}

const ProgressBar = ({ value, color = "bg-green-500" }: { value: number, color?: string }) => (
    <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
        <div
            className={`h-full transition-all duration-100 ease-out ${color}`}
            style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        />
    </div>
);

export function RealtimeDiagnostics({ stats, mode }: RealtimeDiagnosticsProps) {
    const isConn = stats.wsState === 'OPEN';
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="absolute top-4 left-4 z-50">
            <div className={`bg-black/80 backdrop-blur-md rounded-lg border border-white/10 shadow-xl text-xs font-mono text-gray-300 transition-all overflow-hidden ${isExpanded ? 'w-64 p-3' : 'w-auto p-2 cursor-pointer hover:bg-black/90'}`}>
                
                {/* Header (Always Visible) */}
                <div 
                    className={`flex items-center justify-between ${isExpanded ? 'border-b border-white/10 pb-2 mb-3' : ''} cursor-pointer`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white hidden sm:inline">AUDIO DEBUG</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${isConn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {stats.wsState}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                    <div className="space-y-3">
                        {/* Audio Levels */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span>MIC (L)</span>
                                <span className="text-gray-500">{(stats.micLevel * 100).toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={stats.micLevel * 3} color="bg-emerald-400" />

                            <div className="flex justify-between pt-1">
                                <span>RMT (R)</span>
                                <span className="text-gray-500">{(stats.remoteLevel * 100).toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={stats.remoteLevel * 3} color="bg-blue-400" />
                        </div>

                        {/* Latency Stats */}
                        <div className="bg-white/5 rounded p-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><Server className="w-3 h-3" /> STT</span>
                                <span className="text-yellow-400">{stats.sttLatency.toFixed(0)}ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI</span>
                                <span className="text-purple-400">{stats.aiLatency.toFixed(0)}ms</span>
                            </div>
                            <div className="border-t border-white/10 mt-1 pt-1 flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> LOOP</span>
                                <span className={stats.totalLatency > 600 ? 'text-red-400' : 'text-green-400'}>
                                    {stats.totalLatency.toFixed(0)}ms
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
