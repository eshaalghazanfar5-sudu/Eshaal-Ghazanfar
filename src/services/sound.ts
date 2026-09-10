/**
 * Web Audio API based notification chime synthesizer.
 * Generates a clean, harmonious bell chime without external audio assets.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Play a clean, modern melodic chime (C5 -> E5 -> G5)
   */
  public playReminderChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.3 },     // C5
        { freq: 659.25, time: 0.1, duration: 0.35 },  // E5
        { freq: 783.99, time: 0.22, duration: 0.6 },  // G5
        { freq: 1046.50, time: 0.35, duration: 0.8 }, // C6
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.18, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration);
      });
    } catch (err) {
      console.warn('Audio chime playback failed:', err);
    }
  }

  /**
   * Quick pop sound for task completion
   */
  public playTaskComplete(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();
