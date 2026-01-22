
import React, { useMemo } from 'react';
import { UserStats } from '../../types';
import { ArrowLeft, Calendar, Trash2, History, TrendingUp, Clock, Flame, Zap } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HistoryViewProps {
  stats: UserStats;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ stats, onBack }) => {
  // 计算统计数据
  const summary = useMemo(() => {
    const totalMinutes = stats.sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalSessions = stats.sessions.length;
    
    // 计算连续达标天数 (Streak)
    const sessionDays = Array.from(new Set(stats.sessions.map(s => new Date(s.timestamp).toDateString())));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    while (sessionDays.includes(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { totalMinutes, totalSessions, streak };
  }, [stats.sessions]);

  // 生成热力图数据 (最近30天)
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const count = stats.sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr).length;
      days.push({ date: d, count });
    }
    return days;
  }, [stats.sessions]);

  // 生成趋势图数据
  const chartData = useMemo(() => {
    return stats.sessions.slice(-10).map(s => ({
      date: new Date(s.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      cycles: s.cyclesCompleted
    }));
  }, [stats.sessions]);

  const handleClear = () => {
    if (confirm("确定要清空所有历史记录吗？这会移除所有勋章和统计数据。")) {
      storageService.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 animate-in slide-in-from-right-4 duration-500 bg-slate-950 overflow-y-auto max-h-screen scrollbar-hide">
      <header className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 py-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">训练统计</h2>
        <div className="flex-1"></div>
        <button onClick={handleClear} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      {stats.sessions.length > 0 ? (
        <div className="space-y-6 pb-12">
          {/* 核心指标 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-2xl flex flex-col items-center justify-center">
              <Clock size={16} className="text-emerald-400 mb-1" />
              <span className="text-xs text-slate-500 font-bold mb-1">总时长</span>
              <span className="text-lg font-black text-emerald-100">{summary.totalMinutes}<span className="text-[10px] ml-0.5">m</span></span>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-2xl flex flex-col items-center justify-center">
              <Zap size={16} className="text-emerald-400 mb-1" />
              <span className="text-xs text-slate-500 font-bold mb-1">总次数</span>
              <span className="text-lg font-black text-emerald-100">{summary.totalSessions}</span>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-2xl flex flex-col items-center justify-center">
              <Flame size={16} className="text-orange-400 mb-1" />
              <span className="text-xs text-slate-500 font-bold mb-1">连续</span>
              <span className="text-lg font-black text-orange-100">{summary.streak}<span className="text-[10px] ml-0.5">天</span></span>
            </div>
          </div>

          {/* 训练一致性热力图 */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-emerald-500" />
              训练一致性 (近30天)
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {heatmapData.map((day, i) => (
                <div 
                  key={i} 
                  title={day.date.toLocaleDateString()}
                  className={`aspect-square rounded-sm transition-colors duration-500 ${
                    day.count === 0 ? 'bg-slate-800' :
                    day.count === 1 ? 'bg-emerald-900' :
                    day.count === 2 ? 'bg-emerald-700' : 'bg-emerald-500'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              <span>30天前</span>
              <div className="flex items-center gap-1">
                <span>频率:</span>
                <div className="w-2 h-2 bg-slate-800 rounded-sm" />
                <div className="w-2 h-2 bg-emerald-700 rounded-sm" />
                <div className="w-2 h-2 bg-emerald-500 rounded-sm" />
              </div>
              <span>今天</span>
            </div>
          </div>

          {/* 训练趋势图 */}
          <div className="bg-emerald-900/10 p-4 rounded-2xl border border-emerald-500/20">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" />
              近期强度趋势 (远近循环次数)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCycles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cycles" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorCycles)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 详细列表 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">详细日志</h3>
            {[...stats.sessions].reverse().slice(0, 20).map(session => (
              <div key={session.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-200">
                      {new Date(session.timestamp).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{session.cyclesCompleted} 组</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{session.durationMinutes} 分钟训练</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-20">
          <History size={64} className="text-slate-800 mb-4" />
          <p className="text-slate-400 font-medium">暂无历史记录。<br/>立即开始你的第一次护眼训练吧！</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
