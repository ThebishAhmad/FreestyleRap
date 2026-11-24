import { AudioContextManager } from "./AudioContextManager";

/**
 * Procedural Arena Sound Effects Engine for Battle Rap.
 * Generates crowd cheers, air horns, round bells, and punchline hits
 * purely via Web Audio API nodes — zero external files or network requests needed.
 */
export class ArenaAudio {
    private static instance: ArenaAudio | null = null;
    private isMuted: boolean = false;

    public static getInstance(): ArenaAudio {
        if (!ArenaAudio.instance) {
            ArenaAudio.instance = new ArenaAudio();
        }
        return ArenaAudio.instance;
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    public getMuted(): boolean {
        return this.isMuted;
    }

    private getContext(): AudioContext | null {
        try {
            let ctx = AudioContextManager.getInstance().getAudioContext();
            if (!ctx && typeof window !== "undefined") {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    ctx = new AudioContextClass();
                }
            }
            if (ctx && ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }
            return ctx;
        } catch {
            return null;
        }
    }

    /**
     * Classic Hip-Hop / Dancehall Airhorn ("BRRR-BRRR-BRRR-BRRRR")
     */
    public playAirhorn() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const bursts = [0, 0.12, 0.24, 0.40];
        const durations = [0.08, 0.08, 0.10, 0.35];

        bursts.forEach((startTime, idx) => {
            const dur = durations[idx];
            const t0 = ctx.currentTime + startTime;

            // Airhorn base pitches (approx F#5 + B5 + D#6 for rich brass sound)
            const freqs = [370, 466, 554, 740];

            freqs.forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq, t0);
                // Slight pitch scoop at beginning of each burst
                osc.frequency.exponentialRampToValueAtTime(freq * 1.04, t0 + dur * 0.4);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t0 + dur);

                gain.gain.setValueAtTime(0.001, t0);
                gain.gain.linearRampToValueAtTime(0.08, t0 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(t0);
                osc.stop(t0 + dur);
            });
        });
    }

    /**
     * Arena Crowd Roar / Hype reaction ("OHHHHHHH!")
     */
    public playCrowdCheer(intensity: "small" | "hype" | "wild" = "hype") {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const dur = intensity === "wild" ? 2.5 : intensity === "hype" ? 1.8 : 1.0;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Pink/filtered noise generation
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            output[i] = (b0 + b1 + b2) * 0.4;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.3);
        filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + dur);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const gain = ctx.createGain();
        const peakGain = intensity === "wild" ? 0.35 : intensity === "hype" ? 0.22 : 0.12;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start(ctx.currentTime);
        whiteNoise.stop(ctx.currentTime + dur);
    }

    /**
     * Heavy Punchline Sub Hit / Impact
     */
    public playPunchlineHit() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Sub bass drop
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(110, now);
        subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.4);

        subGain.gain.setValueAtTime(0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.45);

        // Click / transient punch
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = "triangle";
        clickOsc.frequency.setValueAtTime(800, now);
        clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

        clickGain.gain.setValueAtTime(0.25, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.06);
    }

    /**
     * Round Start Bell / Gong ("DING!")
     */
    public playRoundBell() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const tones = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chime

        tones.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);

            const dur = 1.6 + idx * 0.3;
            gain.gain.setValueAtTime(0.18 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
        });
    }

    /**
     * Crowd Boo / Disappointed Gasp
     */
    public playCrowdBoo() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.8);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    /**
     * DJ Turntable Scratch / Rewind
     */
    public playRecordScratch() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    /**
     * Metronome Downbeat & Upbeat Click
     */
    public playTick(isDownbeat: boolean = false) {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, now);

        gain.gain.setValueAtTime(isDownbeat ? 0.25 : 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    /**
     * Cypher Reverb Clap / Snare
     */
    public playReverbClap() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const bufferSize = Math.floor(ctx.sampleRate * 0.45);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.45);
    }

    /**
     * Success / Rhyme Lock Chime (Upward harmonic arpeggio)
     */
    public playSuccessChime() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const t = ctx.currentTime + idx * 0.06;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    /**
     * Failure / Choke Buzzer
     */
    public playFailureBuzzer() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(95, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * Arcade Punch Impact (Street Fighter style hit)
     */
    public playArcadeHit(isCritical: boolean = false) {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Sub Thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(isCritical ? 180 : 130, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

        gain.gain.setValueAtTime(isCritical ? 0.6 : 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // Noise snap
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const nFilter = ctx.createBiquadFilter();
        nFilter.type = "highpass";
        nFilter.frequency.setValueAtTime(isCritical ? 800 : 1400, now);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(isCritical ? 0.4 : 0.25, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.08);
    }

    /**
     * Super Cyber Cannon Laser Sweep
     */
    public playSuperBeam() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.85);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
    }

    /**
     * Arcade K.O. Impact Gong
     */
    public playKoGong() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.4);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.5);
    }

    /**
     * Retro "FIGHT!" Announcement Chime
     */
    public playRoundFight() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [440, 660, 880].forEach((freq, idx) => {
            const t = now + idx * 0.12;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "square";
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }
}
