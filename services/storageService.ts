
import { TrainingSession, UserStats, Badge } from '../types';

const STORAGE_KEY = 'vision_quest_stats';

const TITLES = [
  "视力修行者", "护眼小达人", "明眸卫士", "瞳之觉醒", 
  "视界观察员", "光影捕捉者", "视域拓荒者", "清透之眼"
];

export const ALL_BADGES: Badge[] = [
  { id: 'b1', name: '初出茅庐', description: '完成第一次视力训练', unlocked: false, iconType: 'star' },
  { id: 'b2', name: '坚持不懈', description: '累计完成 5 次训练', unlocked: false, iconType: 'medal' },
  { id: 'b3', name: '护眼专家', description: '累计完成 20 次训练', unlocked: false, iconType: 'shield' },
  { id: 'b4', name: '满月守护者', description: '达成 30 天连续打卡里程碑', unlocked: false, iconType: 'moon' },
  { id: 'b5', name: '极限聚焦', description: '单次训练超过 10 组循环', unlocked: false, iconType: 'flame' },
  { id: 'b6', name: '瞳之觉醒', description: '累计完成 100 次训练', unlocked: false, iconType: 'trophy' },
];

export const storageService = {
  getStats(): UserStats {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { sessions: [], badges: [], currentStreak: 0 };
    try {
      const parsed = JSON.parse(data);
      return {
        sessions: parsed.sessions || [],
        badges: parsed.badges || [],
        currentStreak: parsed.currentStreak || 0,
        lastTrainingDate: parsed.lastTrainingDate
      };
    } catch {
      return { sessions: [], badges: [], currentStreak: 0 };
    }
  },

  saveSession(session: TrainingSession): { newBadge?: string; dailyTitle: string } {
    const stats = this.getStats();
    const today = new Date().toDateString();
    
    // Streak logic
    if (stats.lastTrainingDate) {
      const lastDate = new Date(stats.lastTrainingDate);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }
    
    stats.lastTrainingDate = today;

    // Generate daily title
    const dailyTitle = TITLES[Math.floor(Math.random() * TITLES.length)];
    session.earnedTitle = dailyTitle;
    
    stats.sessions.push(session);
    
    // Badge unlocking logic
    let newBadgeName: string | undefined;
    const checkAndUnlock = (id: string, name: string) => {
      if (!stats.badges.includes(id)) {
        stats.badges.push(id);
        newBadgeName = name;
      }
    };

    const totalSessions = stats.sessions.length;
    if (totalSessions >= 1) checkAndUnlock('b1', '初出茅庐');
    if (totalSessions >= 5) checkAndUnlock('b2', '坚持不懈');
    if (totalSessions >= 20) checkAndUnlock('b3', '护眼专家');
    if (totalSessions >= 100) checkAndUnlock('b6', '瞳之觉醒');
    
    if (stats.currentStreak >= 30) checkAndUnlock('b4', '满月守护者');
    if (session.cyclesCompleted >= 10) checkAndUnlock('b5', '极限聚焦');

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    return { newBadge: newBadgeName, dailyTitle };
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
