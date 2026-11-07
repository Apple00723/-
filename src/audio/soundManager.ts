// Web Audio API Procedural Sound Engine & Speech Synthesis for VR Courseware

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmOscs: OscillatorNode[] = [];
  private bgmInterval: number | null = null;
  private isMuted: boolean = false;
  private isVoiceMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.25;
      this.sfxGain.gain.value = 0.45;
      this.bgmGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmGain && this.sfxGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.25;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.45;
    }
    if (this.isMuted) {
      window.speechSynthesis?.cancel();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Futuristic UI Click SFX
  public playClickSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    filter.type = 'highpass';
    filter.frequency.value = 400;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Tech Beep / Activation SFX
  public playBeepSFX(freq = 980) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.setValueAtTime(freq * 1.5, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Particle Warp & Membrane Tunnel "嗖嗖" Whoosh SFX
  public playWarpWhooshSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 2.4;

    // 1. Filtered White Noise for rush effect
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.value = 3.5;
    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(3200, now + 1.2);
    noiseFilter.frequency.exponentialRampToValueAtTime(150, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.45, now + 1.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);

    // 2. Sub-bass warp sweep
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(280, now + 0.8);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + duration);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.9);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + duration);
  }

  // Molecular Docking / Catalysis SFX
  public playDockingSFX(isSuccess: boolean = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isSuccess) {
      // Pleasant chord
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc2.frequency.setValueAtTime(783.99, now); // G5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6
    } else {
      // Inhibited clash / metallic clink
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(280, now + 0.2);
      osc2.frequency.setValueAtTime(450, now);
      osc2.frequency.exponentialRampToValueAtTime(390, now + 0.2);
    }

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // 手柄抓取提示音 (Grab Pickup Chirp)
  public playGrabSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 底物卡入活性中心的“咔哒”机械/磁吸声 (Mechanical Clack & Magnetic Snap SFX)
  public playMagneticSnapSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Sharp mechanical click
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'square';
    oscClick.frequency.setValueAtTime(1800, now);
    oscClick.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    gainClick.gain.setValueAtTime(0.4, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    oscClick.connect(gainClick);
    gainClick.connect(this.sfxGain);
    oscClick.start(now);
    oscClick.stop(now + 0.06);

    // 2. Magnetic suction resonance
    const oscMag = this.ctx.createOscillator();
    const gainMag = this.ctx.createGain();
    oscMag.type = 'sine';
    oscMag.frequency.setValueAtTime(240, now + 0.02);
    oscMag.frequency.exponentialRampToValueAtTime(640, now + 0.12);

    gainMag.gain.setValueAtTime(0.35, now + 0.02);
    gainMag.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    oscMag.connect(gainMag);
    gainMag.connect(this.sfxGain);
    oscMag.start(now + 0.02);
    oscMag.stop(now + 0.24);
  }

  // 反应成功的清脆叮咚声 (Reaction Success Ding-Dong Chime)
  public playReactionSuccessSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Note 1: "Ding" (G5, 784 Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(783.99, now);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.42);

    // Note 2: "Dong" (C6, 1046.5 Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.14);

    gain2.gain.setValueAtTime(0.38, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.68);
  }

  // 碰撞弹开的“弹簧/击退”音效 (Repel / Spring Bounce SFX)
  public playBounceSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Rapid spring wobble pitch sweep
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 告警音 / 空间排斥音效 (Alert / Warning Buzzer SFX)
  public playAlertSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Two rapid warning pulses (Buzzer)
    [0, 0.1].forEach((delay) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(360, now + delay);
      osc.frequency.setValueAtTime(320, now + delay + 0.04);

      gain.gain.setValueAtTime(0.28, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.085);
    });
  }

  // 酶构象扭曲变形的重低音音效 (Conformational Distortion Sub-bass & Morph SFX)
  public playConformationalDistortionSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 1.2;

    // 1. Heavy resonant sub-bass sweep downward (160 Hz -> 38 Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.6);
    subOsc.frequency.exponentialRampToValueAtTime(34, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.8);
    filter.Q.value = 6.0; // High resonant distortion squelch

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.48, now + 0.12);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(filter);
    filter.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + duration + 0.05);

    // 2. Warping LFO Tremolo for macromolecular twisting tension
    const morphOsc = this.ctx.createOscillator();
    const morphGain = this.ctx.createGain();
    morphOsc.type = 'sine';
    morphOsc.frequency.setValueAtTime(95, now);
    morphOsc.frequency.linearRampToValueAtTime(60, now + duration);

    morphGain.gain.setValueAtTime(0.01, now + 0.05);
    morphGain.gain.linearRampToValueAtTime(0.3, now + 0.25);
    morphGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    morphOsc.connect(morphGain);
    morphGain.connect(this.sfxGain);

    morphOsc.start(now + 0.05);
    morphOsc.stop(now + duration + 0.05);
  }

  // 别构锁定警告音 / 变形锁孔拒绝音 (Lock Warning & Mismatched Active Pocket SFX)
  public playLockWarningSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Heavy mechanical lock clank (Deep thump)
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(220, now);
    thump.frequency.exponentialRampToValueAtTime(55, now + 0.08);

    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    thump.connect(thumpGain);
    thumpGain.connect(this.sfxGain);
    thump.start(now);
    thump.stop(now + 0.13);

    // Dual locked warning buzzers (440Hz -> 310Hz)
    [0.08, 0.22].forEach((delay) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now + delay);
      osc.frequency.setValueAtTime(280, now + delay + 0.06);

      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.11);
    });
  }

  // 浓度滑块滑动微触音 (Slider Tick SFX)
  public playSliderTickSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 通关欢呼声 / 胜利号角 (Victory Cheer & Brass Fanfare)
  public playCheerSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Triumphant Ascending Fanfare (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + (idx === 3 ? 1.2 : 0.35));

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + (idx === 3 ? 1.25 : 0.38));
    });

    // 2. Crowd Cheering Shimmer (Filtered warm noise burst)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.8));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now + 0.3);
      noise.stop(now + 1.9);
    } catch {
      // Audio buffer fallback safe
    }
  }

  // 金币/勋章结算音效 (Gold Coins & Level-up Shimmer Chime)
  public playLevelUpMedalSFX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Rapid cascade of 5 crystal coin clinks
    const coinPitches = [1318.5, 1567.98, 1975.53, 2093.0, 2637.0];
    coinPitches.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.48);
    });
  }

  // Ambient Futuristic BGM Synthesis (Gentle warm sci-fi pad chords)
  public startAmbientBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;
    this.isBgmPlaying = true;

    const chords = [
      [130.81, 164.81, 196.00, 246.94], // C major 7th / warm
      [110.00, 146.83, 174.61, 220.00], // A minor 7th
      [146.83, 185.00, 220.00, 277.18], // D minor 7th
      [98.00, 123.47, 146.83, 196.00],  // G major
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const freqs = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const duration = 5.8;

      freqs.forEach((freq) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Subtle detune for shimmer
        osc.detune.value = (Math.random() - 0.5) * 8;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(1100, now + duration / 2);
        filter.frequency.linearRampToValueAtTime(550, now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    };

    playChord();
    this.bgmInterval = window.setInterval(playChord, 5200);
  }

  public stopAmbientBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // -------------------------------------------------------------
  // Magnetic Youth Knowledge Commentator Voice Synthesis Engine
  // (磁性知识博主音色引擎：沉稳温润、青年学者、自然去人机感)
  // -------------------------------------------------------------
  public selectedStyle: 'youth_commentator' | 'deep_commentator' | 'fast_commentator' = 'deep_commentator';
  private speechRate: number = 1.05; // Magnetic scholar commentary cadence
  private speechPitch: number = 0.92; // Warm resonant chest tone, completely natural & non-robotic
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private currentVoiceName: string = '🎙️ 磁性知识博主 (沉稳自然男声)';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveTimer: number | null = null;

  public initVoiceEngine() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
      // Resume if browser suspended
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }

  // Unlocks browser audio autoplay and speech synthesis upon any user click
  public unlockAudio() {
    this.initContext();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
      this.detectBestMaleVoice();
    }
  }

  public detectBestMaleVoice(): { voice: SpeechSynthesisVoice | null; displayName: string } {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return { voice: null, displayName: '系统默认' };
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.cachedVoices = voices;
    }
    const pool = this.cachedVoices.length > 0 ? this.cachedVoices : voices;

    const zhVoices = pool.filter(v => 
      v.lang.toLowerCase().includes('zh') || 
      v.lang.toLowerCase().includes('cmn') ||
      v.lang.toLowerCase().includes('chinese')
    );

    // 1. Top Priority: Renowned Magnetic Male Knowledge Commentator Voices (云健 Yunjian, 云希 Yunxi, 云扬 Yunyang, 博清 Boqing)
    const topExplainerKeywords = [
      'yunjian',   // Microsoft Yunjian Online (Natural) - 经典磁性知识博主男声
      '云健',
      'yunxi',     // Microsoft Yunxi Online (Natural) - 经典科普青年解说男声
      '云希',
      'boqing',    // Apple Boqing 博清 (macOS/iOS 自然青年男声)
      '博清',
      'yunyang',   // Microsoft Yunyang Online (Natural) - 阳光沉稳解说
      '云扬',
      'yunfeng',   // Microsoft Yunfeng Online (Natural)
      '云枫',
      'kangkang',  // 康康 (男声)
      'sin-ji',
    ];

    for (const kw of topExplainerKeywords) {
      const match = zhVoices.find(v => v.name.toLowerCase().includes(kw));
      if (match) {
        const cleanName = match.name.replace(/online/i, '').replace(/natural/i, '自然').trim();
        this.currentVoiceName = `🎙️ ${cleanName} (磁性博主男声)`;
        return { voice: match, displayName: this.currentVoiceName };
      }
    }

    // 2. Second Priority: Any voice tagged with male keywords
    const maleKeywords = ['male', '男', 'boy', 'guy', 'nan'];
    const maleVoice = zhVoices.find(v => 
      maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (maleVoice) {
      this.currentVoiceName = `🎙️ ${maleVoice.name} (磁性博主男声)`;
      return { voice: maleVoice, displayName: this.currentVoiceName };
    }

    // 3. Third Priority: Natural/Neural Chinese voices
    const neuralVoice = zhVoices.find(v => 
      v.name.toLowerCase().includes('natural') || 
      v.name.toLowerCase().includes('neural') || 
      v.name.toLowerCase().includes('google')
    );
    if (neuralVoice) {
      this.currentVoiceName = `🎙️ ${neuralVoice.name} (磁性博主男声)`;
      return { voice: neuralVoice, displayName: this.currentVoiceName };
    }

    // 4. Fallback: Any Chinese voice with lower pitch tuning for energetic masculine resonance
    const fallback = zhVoices[0] || pool[0] || null;
    this.currentVoiceName = fallback ? `🎙️ ${fallback.name} (磁性博主男声)` : '🎙️ 磁性知识博主男声';
    return { voice: fallback, displayName: this.currentVoiceName };
  }

  public setVoiceStyle(style: 'youth_commentator' | 'deep_commentator' | 'fast_commentator') {
    this.selectedStyle = style;
    this.speechRate = 1.05;
    this.speechPitch = 0.92;
  }

  public getVoiceStyle(): 'youth_commentator' | 'deep_commentator' | 'fast_commentator' {
    return this.selectedStyle;
  }

  public getCurrentVoiceName(): string {
    return this.currentVoiceName;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate;
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  // Preprocess text to sound natural, lively, and fluent like a genuine online commentator
  private preprocessTextForCommentary(raw: string): string {
    return raw
      // Clean up symbols that cause robotic verbalizations
      .replace(/[★●✖■▲▼💡🎙️⚡✓]/g, ' ')
      // Remove arrows, em-dashes, brackets that cause robotic pauses
      .replace(/——/g, '，')
      .replace(/--/g, '，')
      .replace(/·/g, '，')
      .replace(/【(.*?)】/g, '$1')
      .replace(/（(.*?)）/g, '，$1，')
      .replace(/\((.*?)\)/g, '，$1，')
      // Smooth technical chemical nomenclature
      .replace(/HMG-CoA\s*还原酶/gi, 'HMG辅酶A还原酶')
      .replace(/HMG-CoA/gi, 'HMG辅酶A')
      .replace(/V_?\{?max\}?/gi, '最大催化反应速度V-max')
      .replace(/Vmax/gi, '最大催化反应速度V-max')
      .replace(/K_?\{?m\}?/gi, '米氏常数K-m')
      .replace(/Km/gi, '米氏常数K-m')
      .replace(/ATP/gi, 'ATP高能分子')
      .replace(/\[S\]/g, '底物浓度')
      .replace(/\[I\]/g, '抑制剂浓度')
      .replace(/VR/gi, 'VR')
      .replace(/Rx/gi, '临床处方')
      .replace(/(\d+)%/g, '百分之$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Voiceover notification chime
  public playCommentaryTone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    osc2.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  }

  // Web Speech API Voice-Over Narration (Synchronous within user gesture context)
  public speak(text: string, onEnd?: () => void, customRate?: number, customPitch?: number) {
    // Immediately stop and abort any previous speech utterance
    this.stopSpeech();

    if (this.isMuted || this.isVoiceMuted || typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.unlockAudio();

      if (!window.speechSynthesis) {
        if (onEnd) onEnd();
        return;
      }

      // Safe resume
      window.speechSynthesis.resume();

      // Refresh voice list
      const freshVoices = window.speechSynthesis.getVoices();
      if (freshVoices && freshVoices.length > 0) {
        this.cachedVoices = freshVoices;
      }

      const preprocessed = this.preprocessTextForCommentary(text);
      if (!preprocessed) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(preprocessed);
      utterance.rate = customRate ?? this.speechRate;
      utterance.pitch = customPitch ?? this.speechPitch;
      utterance.volume = 1.0;

      const { voice } = this.detectBestMaleVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'zh-CN';
      } else {
        utterance.lang = 'zh-CN';
      }

      utterance.onstart = () => {
        window.speechSynthesis.resume();
      };

      utterance.onend = () => {
        if (this.keepAliveTimer) {
          clearInterval(this.keepAliveTimer);
          this.keepAliveTimer = null;
        }
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error event:', e);
        if (this.keepAliveTimer) {
          clearInterval(this.keepAliveTimer);
          this.keepAliveTimer = null;
        }
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      // Hold strong reference on instance to prevent Chrome GC bug
      this.currentUtterance = utterance;

      // Speak inside user interaction
      try {
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.resume();
      } catch (synthErr) {
        console.warn('SpeechSynthesis.speak failed:', synthErr);
      }

      // Chrome watchdog to prevent long audio stutter
      this.keepAliveTimer = window.setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          if (!window.speechSynthesis.speaking) {
            if (this.keepAliveTimer) {
              clearInterval(this.keepAliveTimer);
              this.keepAliveTimer = null;
            }
          } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
      }, 1500);
    } catch (err) {
      console.warn('speak outer error:', err);
      if (onEnd) onEnd();
    }
  }

  public stopSpeech() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    this.currentUtterance = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundManager = new SoundManager();
