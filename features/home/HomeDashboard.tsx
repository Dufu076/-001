
import React, { useState, useEffect } from 'react';
import { UserStats, TrainingSettings, Badge } from '../../types';
import { Play, History, Award, Zap, Settings, X, Clock, Music, Star, Medal, Shield, Trophy, Moon, Flame, Sparkles } from 'lucide-react';
import { feedbackService } from '../../services/ttsService';
import { storageService, ALL_BADGES } from '../../services/storageService';

interface HomeDashboardProps {
  stats: UserStats;
  settings: TrainingSettings;
  onUpdateSettings: (s: TrainingSettings) => void;
  onStart: () => void;
  onViewHistory: () => void;
}

const BadgeIcon = ({ type, size = 24 }: { type: Badge['iconType']; size?: number }) => {
  switch (type) {
    case 'star': return <Star size={size} />;
    case 'medal': return <Medal size={size} />;
    case 'shield': return <Shield size={size} />;
    case 'trophy': return <Trophy size={size} />;
    case 'moon': return <Moon size={size} />;
    case 'flame': return <Flame size={size} />;
    default: return <Award size={size} />;
  }
};

const HomeDashboard: React.FC<HomeDashboardProps> = ({ stats, settings, onUpdateSettings, onStart, onViewHistory }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const todayStr = new Date().toDateString();
  const sessionsToday = stats.sessions.filter(s => new Date(s.timestamp).toDateString() === todayStr);

  useEffect(() => {
    const updateVoices = () => setVoices(feedbackService.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  return (
    <div className="flex flex-col flex-1 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-900">
      <header className="pt-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-400 tracking-tight drop-shadow-lg">
            视力觉醒 <span className="text-xl block text-slate-500 font-medium">Vision Quest</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBadges(true)}
            className="p-2 bg-slate-800 rounded-full text-amber-400 hover:bg-slate-700 transition-all border border-amber-400/20"
          >
            <Award size={24} />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/20 shadow-inner group">
          <div className="flex items-center gap-2 text-emerald-400 mb-1 group-hover:scale-105 transition-transform">
            <Zap size={18} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">今日训练</span>
          </div>
          <p className="text-3xl font-black">{sessionsToday.length} <span className="text-sm font-normal text-slate-400">次</span></p>
        </div>
        <div className="bg-amber-900/10 p-4 rounded-2xl border border-amber-500/20 shadow-inner group">
          <div className="flex items-center gap-2 text-amber-400 mb-1 group-hover:scale-105 transition-transform">
            <Flame size={18} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">连续打卡</span>
          </div>
          <p className="text-3xl font-black">{stats.currentStreak} <span className="text-sm font-normal text-slate-400">天</span></p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center relative py-10">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <button 
          onClick={onStart}
          className="group relative flex items-center justify-center w-52 h-52 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all duration-500 shadow-[0_0_80px_-20px_rgba(16,185,129,0.4)] active:scale-95 z-10"
        >
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 group-hover:scale-125 group-hover:opacity-0 transition-all duration-700"></div>
          <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:scale-110 transition-all duration-500"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Play fill="white" className="text-white w-8 h-8 ml-1" />
            </div>
            <span className="text-white font-black text-xl uppercase tracking-[0.3em]">开启训练</span>
            <span className="text-emerald-200/60 text-[10px] font-bold mt-2 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">{settings.totalDurationMinutes} MINS</span>
          </div>
        </button>

        <div className="mt-12 flex flex-col items-center space-y-4">
           <div className="flex -space-x-2">
             {stats.badges.slice(0, 3).map((bid) => {
               const b = ALL_BADGES.find(x => x.id === bid);
               return b ? (
                 <div key={bid} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-amber-400 shadow-lg">
                   <BadgeIcon type={b.iconType} size={18} />
                 </div>
               ) : null;
             })}
             {stats.badges.length > 3 && (
               <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-slate-400 text-xs font-bold shadow-lg">
                 +{stats.badges.length - 3}
               </div>
             )}
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
             <Sparkles size={14} className="text-emerald-400" />
             已获得 {stats.badges.length} 个视界荣誉
           </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onViewHistory}
          className="flex-1 flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 p-5 rounded-3xl transition-all border border-slate-700/50 font-bold group"
        >
          <History size={20} className="text-slate-400 group-hover:-rotate-45 transition-transform" />
          <span className="tracking-wide">查看训练轨迹</span>
        </button>
      </div>

      {/* Badge Gallery Modal */}
      {showBadges && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-sm rounded-[40px] border border-amber-500/20 p-8 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setShowBadges(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-4 border border-amber-500/20">
                <Award size={40} className="text-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-white shimmer-text">视界勋章馆</h3>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Badge Collection</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {ALL_BADGES.map((badge) => {
                const isUnlocked = stats.badges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${
                      isUnlocked 
                        ? 'bg-slate-800/80 border-amber-500/30' 
                        : 'bg-slate-800/20 border-slate-800 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isUnlocked ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/20' : 'bg-slate-800 text-slate-600'
                    }`}>
                      <BadgeIcon type={badge.iconType} size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-black text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{badge.description}</p>
                    </div>
                    {isUnlocked && <Sparkles size={16} className="text-amber-400 animate-pulse" />}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-top border-slate-800 flex justify-center">
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">勋章等级: {stats.badges.length}/{ALL_BADGES.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Unchanged apart from minor style polish) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-xs rounded-[40px] border border-slate-800 p-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white tracking-tight">实验室设置</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">训练时长设定</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map(duration => (
                    <button
                      key={duration}
                      onClick={() => onUpdateSettings({ ...settings, totalDurationMinutes: duration })}
                      className={`py-3 rounded-2xl text-sm font-black transition-all border ${
                        settings.totalDurationMinutes === duration 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/40 scale-105' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {duration}分
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">沉浸式听感</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, backgroundTheme: 'none' })}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                      settings.backgroundTheme === 'none' 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/40' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    静音
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, backgroundTheme: 'forest_meditation' })}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                      settings.backgroundTheme === 'forest_meditation' 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/40' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    冥想森林
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">语音鼓励系统</span>
                  <button 
                    onClick={() => onUpdateSettings({ ...settings, encouragementEnabled: !settings.encouragementEnabled })}
                    className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${settings.encouragementEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${settings.encouragementEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">触感/声音反馈</span>
                  <button 
                    onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${settings.soundEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                feedbackService.speak("视力恢复，从这一刻开始。", true, { voiceName: settings.voiceName, rate: settings.speakingRate });
              }}
              className="w-full py-4 bg-slate-800 text-emerald-400 rounded-3xl font-black border border-emerald-500/20 hover:bg-slate-750 transition-all active:scale-95 shadow-lg shadow-black/40"
            >
              声学测试
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;
