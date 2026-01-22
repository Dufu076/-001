
import React, { useState, useEffect } from 'react';
import HomeDashboard from './features/home/HomeDashboard';
import TrainingSessionView from './features/training/TrainingSession';
import HistoryView from './features/history/HistoryView';
import { UserStats, TrainingSettings } from './types';
import { storageService } from './services/storageService';

const DEFAULT_SETTINGS: TrainingSettings = {
  voiceName: '',
  speakingRate: 1.0,
  soundEnabled: true,
  encouragementEnabled: true,
  totalDurationMinutes: 5,
  backgroundTheme: 'none'
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'training' | 'history'>('home');
  const [stats, setStats] = useState<UserStats>(storageService.getStats());
  const [settings, setSettings] = useState<TrainingSettings>(() => {
    const saved = localStorage.getItem('vision_quest_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const refreshStats = () => {
    setStats(storageService.getStats());
  };

  const updateSettings = (newSettings: TrainingSettings) => {
    setSettings(newSettings);
    localStorage.setItem('vision_quest_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
      {currentScreen === 'home' && (
        <HomeDashboard 
          stats={stats} 
          settings={settings}
          onUpdateSettings={updateSettings}
          onStart={() => setCurrentScreen('training')} 
          onViewHistory={() => setCurrentScreen('history')}
        />
      )}
      
      {currentScreen === 'training' && (
        <TrainingSessionView 
          settings={settings}
          onComplete={() => {
            refreshStats();
            setCurrentScreen('home');
          }}
          onExit={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryView 
          stats={stats} 
          onBack={() => setCurrentScreen('home')} 
        />
      )}
    </div>
  );
};

export default App;
