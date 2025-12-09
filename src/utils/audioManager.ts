export class AudioManager {
  private static instance: AudioManager;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('atlasBrawlerSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.isMuted = !settings.audioEnabled;
        this.volume = settings.audioVolume || 0.5;
      }
    } catch (err) {
      console.error('Failed to load audio settings:', err);
    }
  }

  createAudio(src: string, id: string, options: {
    loop?: boolean;
    volume?: number;
    preload?: boolean;
  } = {}): HTMLAudioElement {
    const audio = new Audio(src);
    
    audio.loop = options.loop || false;
    audio.volume = this.isMuted ? 0 : (options.volume || this.volume);
    audio.preload = options.preload ? 'auto' : 'none';
    
    this.audioElements.set(id, audio);
    return audio;
  }

  play(id: string): Promise<void> {
    const audio = this.audioElements.get(id);
    if (!audio || this.isMuted) return Promise.resolve();

    audio.currentTime = 0;
    return audio.play().catch(err => {
      console.error(`Failed to play audio ${id}:`, err);
    });
  }

  stop(id: string) {
    const audio = this.audioElements.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  pause(id: string) {
    const audio = this.audioElements.get(id);
    if (audio) {
      audio.pause();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      if (!this.isMuted) {
        audio.volume = this.volume;
      }
    });
  }

  mute() {
    this.isMuted = true;
    this.audioElements.forEach(audio => {
      audio.volume = 0;
    });
  }

  unmute() {
    this.isMuted = false;
    this.audioElements.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return !this.isMuted;
  }

  getVolume(): number {
    return this.volume;
  }

  isAudioMuted(): boolean {
    return this.isMuted;
  }

  cleanup() {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioElements.clear();
  }

  preloadAudios(audioSources: Array<{ id: string; src: string; loop?: boolean }>) {
    audioSources.forEach(({ id, src, loop }) => {
      if (!this.audioElements.has(id)) {
        this.createAudio(src, id, { loop, preload: true });
      }
    });
  }
}

// Convenience function for quick audio playback
export function playQuickSound(src: string, volume: number = 0.5): Promise<void> {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.currentTime = 0;
  return audio.play().catch(err => {
    console.error('Failed to play quick sound:', err);
  });
}