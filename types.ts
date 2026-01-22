
export enum TrainingPhase {
  FAR = 'FAR',
  NEAR = 'NEAR',
  IDLE = 'IDLE',
  COMPLETE = 'COMPLETE'
}

export type BackgroundTheme = 'none' | 'forest_meditation';

export interface TrainingSession {
  id: string;
  timestamp: number;
  durationMinutes: number;
  cyclesCompleted: number;
  earnedTitle?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  date?: number;
  iconType: 'star' | 'medal' | 'flame' | 'shield' | 'trophy' | 'moon';
}

export interface UserStats {
  sessions: TrainingSession[];
  badges: string[]; // Store badge IDs
  currentStreak: number;
  lastTrainingDate?: string;
}

export interface TrainingSettings {
  voiceName: string;
  speakingRate: number;
  soundEnabled: boolean;
  encouragementEnabled: boolean;
  totalDurationMinutes: number;
  backgroundTheme: BackgroundTheme;
}
