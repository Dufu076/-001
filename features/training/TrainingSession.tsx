
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrainingPhase, TrainingSettings, BackgroundTheme } from '../../types';
import { feedbackService } from '../../services/ttsService';
import { storageService } from '../../services/storageService';
import { X, Volume2, VolumeX, Eye, AlertCircle, Heart, Music, PartyPopper, Award, CheckCircle2, RefreshCw, Sparkles, TrendingUp, Trophy, Medal, Clock } from 'lucide-react';

interface TrainingSessionProps {
  settings: TrainingSettings;
  onComplete: () => void;
  onExit: () => void;
}

const THEME_CONFIG: Record<BackgroundTheme, { music: string; bg: string }> = {
  none: { music: '', bg: '' },
  forest_meditation: { 
    music: 'https://cdn.pixabay.com/audio/2024/02/22/audio_145b204e12.mp3', 
    bg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1600' 
  }
};

const VisualGuide: React.FC<{ phase: TrainingPhase; timeLeft: number }> = ({ phase, timeLeft }) => {
  const isFar = phase === TrainingPhase.FAR;

  return (
    <div className="relative w-full max-w-sm aspect-video mb-8 overflow-hidden rounded-3xl border-4 border-white/10 shadow-2xl group bg-slate-900 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
      {/* 远景 SVG 动画 */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isFar ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
        <svg viewBox="0 0 400 225" className="w-full h-full">
          <defs>
            <linearGradient id="animeSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <radialGradient id="sunFlare" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#animeSky)" />
          <circle cx="340" cy="50" r="40" fill="url(#sunFlare)" className="animate-pulse" />
          <circle cx="340" cy="50" r="15" fill="white" />
          <g className="animate-[float_30s_linear_infinite]">
            <path d="M40,60 Q55,40 70,60 Q85,40 100,60 Q115,40 130,60 Z" fill="white" fillOpacity="0.7" />
            <path d="M260,30 Q275,10 290,30 Q305,10 320,30 Z" fill="white" fillOpacity="0.4" />
          </g>
          <path d="M-20,225 L100,100 L220,225 Z" fill="#64748b" fillOpacity="0.3" />
          <path d="M120,225 L240,80 L360,225 Z" fill="#475569" fillOpacity="0.4" />
          <path d="M240,225 L380,120 L480,225 Z" fill="#94a3b8" fillOpacity="0.3" />
          <g transform="translate(200, 110)">
            <circle r="30" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite] opacity-30" />
            <circle r="6" fill="#10b981" className="animate-ping" />
            <circle r="3" fill="#10b981" />
          </g>
          <text x="200" y="200" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900" className="drop-shadow-sm uppercase tracking-[0.2em] opacity-80">眺望远方 • Relaxing Sight</text>
        </svg>
      </div>

      {/* 近景 SVG 动画 */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${!isFar ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
        <svg viewBox="0 0 400 225" className="w-full h-full">
           <defs>
             <radialGradient id="nearFocusBg" cx="50%" cy="40%" r="60%">
               <stop offset="0%" stopColor="#064e3b" />
               <stop offset="100%" stopColor="#020617" />
             </radialGradient>
           </defs>
           <rect width="400" height="225" fill="url(#nearFocusBg)" />
           <g stroke="#10b981" strokeWidth="0.5" opacity="0.3">
             {[...Array(20)].map((_, i) => (
               <line 
                 key={i}
                 x1="200" y1="110" 
                 x2={200 + Math.cos(i * (360/20) * Math.PI/180) * 300} 
                 y2={110 + Math.sin(i * (360/20) * Math.PI/180) * 300} 
                 className="animate-pulse"
                 style={{ animationDelay: `${i * 0.05}s` }}
               />
             ))}
           </g>
           <g transform="translate(175, 75)" className="animate-[pulse_4s_ease-in-out_infinite]">
             <path d="M25,150 C25,100 25,40 50,40 C75,40 75,100 75,150" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
             <rect x="42" y="45" width="16" height="20" rx="4" fill="white" fillOpacity="0.2" />
           </g>
           <text x="200" y="200" textAnchor="middle" fill="#ecfdf5" fontSize="12" fontWeight="900" className="drop-shadow-sm uppercase tracking-[0.2em] opacity-80">盯住指尖 • Intense Focus</text>
        </svg>
      </div>
      <div className={`absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-300 ${timeLeft === 1 ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};

const TrainingSessionView: React.FC<TrainingSessionProps> = ({ settings, onComplete, onExit }) => {
  const [phase, setPhase] = useState<TrainingPhase>(TrainingPhase.FAR);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [totalSeconds, setTotalSeconds] = useState(settings.totalDurationMinutes * 60); 
  const totalSessionTime = settings.totalDurationMinutes * 60;
  
  const [isMuted, setIsMuted] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [wakeLockError, setWakeLockError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [completionData, setCompletionData] = useState<{ newBadge?: string; dailyTitle: string }>({ dailyTitle: '' });
  
  const wakeLockRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const FAR_DURATION = 30;
  const NEAR_DURATION = 5;

  const speak = useCallback((text: string) => {
    feedbackService.speak(text, !isMuted, { voiceName: settings.voiceName, rate: settings.speakingRate });
  }, [isMuted, settings.voiceName, settings.speakingRate]);

  // 核心：启动音频播放
  const startAudio = useCallback(() => {
    const theme = THEME_CONFIG[settings.backgroundTheme];
    if (theme && theme.music && !isMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(theme.music);
      audio.loop = true;
      audio.volume = 0.5;
      audio.crossOrigin = "anonymous";
      
      audio.play()
        .then(() => {
          setAudioError(false);
          audioRef.current = audio;
        })
        .catch(() => setAudioError(true));
    }
  }, [settings.backgroundTheme, isMuted]);

  // 核心：处理屏幕唤醒锁定
  const handleWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn("Wake Lock 无法激活，屏幕可能会休眠:", err);
        setWakeLockError(true);
      }
    }
  }, []);

  // 生命周期管理
  useEffect(() => {
    startAudio();
    handleWakeLock();
    speak("训练开始。请看向远方，放松心情。");
    feedbackService.getAudioContext(); // 激活音频上下文

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [startAudio, handleWakeLock, speak]);

  const handlePhaseChange = useCallback((currentPhase: TrainingPhase) => {
    if (currentPhase === TrainingPhase.FAR) {
      setPhase(TrainingPhase.NEAR);
      setTimeLeft(NEAR_DURATION);
      speak("看向指尖。保持专注。");
      feedbackService.vibrate([200, 100, 200], true);
    } else {
      setPhase(TrainingPhase.FAR);
      setTimeLeft(FAR_DURATION);
      setCycles(prev => prev + 1);
      speak("看向远方。让视力舒缓。");
      feedbackService.vibrate(300, true);
    }
  }, [speak]);

  useEffect(() => {
    if (isFinished) return;

    if (totalSeconds <= 0) {
      const result = storageService.saveSession({
        id: Date.now().toString(),
        timestamp: Date.now(),
        durationMinutes: settings.totalDurationMinutes,
        cyclesCompleted: cycles
      });
      setCompletionData(result);
      setIsFinished(true);
      speak(`训练达成！恭喜您获得“${result.dailyTitle}”称号。`);
      return;
    }

    const timer = setInterval(() => {
      setTotalSeconds(prev => prev - 1);
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 3 && next > 0) {
          if (settings.soundEnabled) feedbackService.beep(1000, 40);
        }
        if (next <= 0) {
          handlePhaseChange(phase);
          return 0; 
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSeconds, timeLeft, phase, handlePhaseChange, cycles, isMuted, settings.soundEnabled, speak, isFinished, settings.totalDurationMinutes]);

  const progressPercentage = ((totalSessionTime - totalSeconds) / totalSessionTime) * 100;

  return (
    <div className={`relative flex flex-1 flex-col transition-all duration-1000 overflow-hidden ${
      phase === TrainingPhase.FAR ? 'bg-slate-950' : 'bg-emerald-950/40'
    }`}>
      {settings.backgroundTheme !== 'none' && (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-30"
          style={{ backgroundImage: `url(${THEME_CONFIG[settings.backgroundTheme].bg})` }} />
      )}
      
      <div className="relative z-10 flex flex-col flex-1">
        <header className="flex justify-between items-center p-6">
          <button onClick={onExit} className="p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full">
            <X size={24} />
          </button>
          <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 text-xs font-bold text-emerald-400">
            {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')} 剩余
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <VisualGuide phase={phase} timeLeft={timeLeft} />
          <h2 className={`text-4xl font-black mb-4 transition-all duration-500 ${phase === TrainingPhase.FAR ? 'text-emerald-400' : 'text-green-300'}`}>
            {phase === TrainingPhase.FAR ? '眺望远方' : '盯住指尖'}
          </h2>
          <div className="text-6xl font-black text-white font-mono tracking-tighter mb-4 tabular-nums">
            {timeLeft}s
          </div>
          {wakeLockError && (
             <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                <AlertCircle size={12} /> 屏幕锁定未生效，请保持活动
             </div>
          )}
        </div>

        <footer className="p-8">
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-emerald-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_#10b981]" 
                 style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span>当前进度 {Math.round(progressPercentage)}%</span>
            <span>已循环 {cycles} 次</span>
          </div>
        </footer>
      </div>

      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-slate-900 w-full max-w-sm rounded-[40px] border border-emerald-500/30 p-10 flex flex-col items-center shadow-2xl celebrate-pop">
            <Award size={64} className="text-amber-400 mb-6 animate-bounce" />
            <h2 className="text-3xl font-black text-white mb-2">训练完成!</h2>
            <div className="bg-emerald-500/10 px-4 py-1 rounded-full mb-8 border border-emerald-500/20">
               <span className="text-emerald-400 text-sm font-black">{completionData.dailyTitle}</span>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-800 p-5 rounded-3xl text-center border border-slate-700">
                 <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">循环组数</p>
                 <p className="text-2xl font-black text-white">{cycles}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-3xl text-center border border-slate-700">
                 <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">持续时间</p>
                 <p className="text-2xl font-black text-white">{settings.totalDurationMinutes}m</p>
              </div>
            </div>

            <button onClick={onComplete} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[32px] transition-all active:scale-95 shadow-xl shadow-emerald-900/40">
              返回主页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSessionView;
