
export const feedbackService = {
  audioCtx: null as AudioContext | null,

  // 获取或初始化音频上下文
  getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // 处理可能的挂起状态
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  // 获取可用中文声音列表
  getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices().filter(v => v.lang.includes('zh'));
  },

  speak(text: string, enabled: boolean, settings?: { voiceName?: string; rate?: number }): void {
    if (!enabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 语速设置
    utterance.rate = settings?.rate || 1.0;
    utterance.pitch = 1.1; // 略微调高音调以模拟温柔女声
    
    // 寻找指定声音
    if (settings?.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find(v => v.name === settings.voiceName);
      if (selected) utterance.voice = selected;
    }

    window.speechSynthesis.speak(utterance);
  },

  vibrate(pattern: number | number[], enabled: boolean): void {
    if (!enabled || !('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  },

  // 播放“滴滴”声
  beep(frequency: number = 880, duration: number = 100): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.warn("Beep 播放失败 (通常是由于浏览器自动播放限制):", e);
    }
  }
};
