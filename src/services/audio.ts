// Web Audio API emergency siren synthesizer for SDRF control room console

class SirenAudioService {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private sweepInterval: number | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.isRunning = true;

    // Master gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.15);
    this.gainNode.connect(this.ctx.destination);

    // Primary warning oscillator (dual-tone industrial warble 440Hz -> 880Hz)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(440, this.ctx.currentTime);

    // Secondary sub-harmonic oscillator for punch (220Hz)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);

    this.osc1.start();
    this.osc2.start();

    // Modulate pitch every 750ms between 440Hz and 880Hz
    let high = false;
    this.sweepInterval = window.setInterval(() => {
      if (!this.ctx || !this.osc1) return;
      const targetFreq = high ? 440 : 880;
      this.osc1.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.6);
      if (this.osc2) {
        this.osc2.frequency.exponentialRampToValueAtTime(targetFreq / 2, this.ctx.currentTime + 0.6);
      }
      high = !high;
    }, 700);
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    }

    setTimeout(() => {
      try {
        if (this.osc1) {
          this.osc1.stop();
          this.osc1.disconnect();
          this.osc1 = null;
        }
        if (this.osc2) {
          this.osc2.stop();
          this.osc2.disconnect();
          this.osc2 = null;
        }
        if (this.gainNode) {
          this.gainNode.disconnect();
          this.gainNode = null;
        }
      } catch (e) {
        console.warn('Error closing siren oscillators', e);
      }
    }, 250);
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  // Play a brief clean operational chime (for dispatch or confirm feedback)
  public playChime() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }
}

export const sirenService = new SirenAudioService();
