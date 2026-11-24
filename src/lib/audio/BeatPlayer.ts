import * as Tone from "tone";

export interface Beat {
    id: string;
    name: string;
    bpm: number;
    style: string;
    bars_per_loop: number;
    energy_level: number; // 1-5
    complexity_level: number; // 1-5
    description?: string;
    audioSrc?: string; // URL for full instrumental track
}

export class BeatPlayer {
    private player: Tone.Player | null = null;
    private loop: Tone.Loop | null = null;
    private baseBpm: number = 120;

    // Master Beat Bus
    private masterVolumeNode: Tone.Volume;
    private currentVolume: number = 80;
    private volumeListener: ((e: Event) => void) | null = null;
    private metronomeListener: ((e: Event) => void) | null = null;

    // Synthesizer Suite & Effects
    private reverb: Tone.Reverb | null = null;
    private kick: Tone.MembraneSynth | null = null;
    private snare: Tone.NoiseSynth | null = null;
    private clap: Tone.NoiseSynth | null = null;
    private hihat: Tone.MetalSynth | null = null;
    private openHat: Tone.MetalSynth | null = null;
    private bass808: Tone.MonoSynth | null = null;
    private synthPad: Tone.PolySynth | null = null;
    private leadSynth: Tone.Synth | null = null;
    private metroClick: Tone.MembraneSynth | null = null;

    private currentBeat: Beat | null = null;
    private isPlaying: boolean = false;
    private isLoaded: boolean = false;
    private metronomeEnabled: boolean = false;

    /**
     * Map linear volume percentage (0 - 100) to perceptual decibels.
     * Natural logarithmic curve:
     * 0 -> -100 dB (Mute)
     * 25 -> -25.4 dB (Practice/Quiet)
     * 50 -> -15.3 dB (Moderate)
     * 65 -> -10.4 dB (Balanced Studio)
     * 80 -> -5.6 dB (Strong Punch)
     * 100 -> 0 dB (Maximum Studio Loudness)
     */
    public static volumeToDb(val: number): number {
        if (val <= 0) return -100;
        const normalized = Math.max(0, Math.min(100, val)) / 100;
        return -45 + Math.pow(normalized, 0.6) * 45;
    }

    constructor() {
        let initialVol = 80;
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("flowstate_beat_volume");
                if (saved !== null) {
                    const parsed = parseInt(saved, 10);
                    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                        initialVol = parsed;
                    }
                }
            } catch (e) {
                console.debug("Could not read flowstate_beat_volume from localStorage:", e);
            }
        }

        this.currentVolume = initialVol;
        this.masterVolumeNode = new Tone.Volume(BeatPlayer.volumeToDb(initialVol)).toDestination();

        // Listen for global real-time volume & metronome events
        if (typeof window !== "undefined") {
            this.volumeListener = (e: Event) => {
                const ce = e as CustomEvent<{ volume: number }>;
                if (ce.detail && typeof ce.detail.volume === "number") {
                    this.setVolume(ce.detail.volume);
                }
            };
            window.addEventListener("flowstate_volume_change", this.volumeListener);

            this.metronomeListener = (e: Event) => {
                const ce = e as CustomEvent<{ metronome: boolean }>;
                if (ce.detail && typeof ce.detail.metronome === "boolean") {
                    this.setMetronome(ce.detail.metronome);
                }
            };
            window.addEventListener("flowstate_metronome_change", this.metronomeListener);
        }
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    public get getCurrentBeat(): Beat | null {
        return this.currentBeat;
    }

    public setMetronome(enabled: boolean) {
        this.metronomeEnabled = enabled;
    }

    public setBpm(bpm: number) {
        const clamped = Math.max(60, Math.min(200, bpm));
        Tone.Transport.bpm.rampTo(clamped, 0.05);

        // Adjust real audio playback rate if loaded
        if (this.player && this.baseBpm > 0) {
            try {
                this.player.playbackRate = clamped / this.baseBpm;
            } catch (e) {
                console.debug("Could not adjust playbackRate:", e);
            }
        }

        if (this.currentBeat) {
            this.currentBeat.bpm = clamped;
        }
    }

    public setVolume(val: number) {
        // Val in range 0 - 100
        this.currentVolume = Math.max(0, Math.min(100, val));
        const db = BeatPlayer.volumeToDb(this.currentVolume);
        if (this.masterVolumeNode) {
            this.masterVolumeNode.volume.rampTo(db, 0.04);
        }
    }

    public getVolume(): number {
        return this.currentVolume;
    }

    public duck(amountDb: number = -12, rampTime: number = 0.2) {
        if (!this.masterVolumeNode) return;
        const currentTargetDb = BeatPlayer.volumeToDb(this.currentVolume);
        this.masterVolumeNode.volume.rampTo(currentTargetDb + amountDb, rampTime);
    }

    public unduck(rampTime: number = 0.3) {
        if (!this.masterVolumeNode) return;
        const currentTargetDb = BeatPlayer.volumeToDb(this.currentVolume);
        this.masterVolumeNode.volume.rampTo(currentTargetDb, rampTime);
    }

    private async initAudio(beat: Beat) {
        this.stop();
        if (this.player) {
            this.player.dispose();
            this.player = null;
        }

        this.baseBpm = beat.bpm;

        // Ensure master volume node matches current volume setting
        if (this.masterVolumeNode) {
            this.masterVolumeNode.volume.value = BeatPlayer.volumeToDb(this.currentVolume);
        }

        // Mode 1: High Quality Real Instrumental Track
        if (beat.audioSrc) {
            try {
                this.player = new Tone.Player({
                    url: beat.audioSrc,
                    loop: true,
                    autostart: false,
                    fadeIn: 0.05,
                    fadeOut: 0.05
                }).connect(this.masterVolumeNode);

                await this.player.load(beat.audioSrc);
                console.log("High-Fidelity Instrumental Beat Loaded:", beat.name);
            } catch (e) {
                console.warn("Failed to load audio track, falling back to rich procedural synths:", e);
                this.player = null;
                this.initSynths();
            }
        } else {
            // Mode 2: Procedural Synthesizer
            this.initSynths();
        }
    }

    private initSynths() {
        if (this.kick) return;

        // Master Spatial Reverb for rich studio depth
        this.reverb = new Tone.Reverb({
            decay: 1.8,
            wet: 0.22,
            preDelay: 0.01
        }).connect(this.masterVolumeNode);

        // 1. Kick (Punchy 808 Sub Kick)
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 5,
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.35,
                sustain: 0.01,
                release: 1.0,
                attackCurve: "exponential"
            }
        }).connect(this.masterVolumeNode);
        this.kick.volume.value = 0;

        // 2. Snare (Crisp Hip-Hop Snare)
        this.snare = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: {
                attack: 0.001,
                decay: 0.22,
                sustain: 0.02,
                release: 0.2
            }
        }).connect(this.masterVolumeNode);
        this.snare.volume.value = -3;

        // 3. Clap (Layered Stereo Clap)
        this.clap = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: {
                attack: 0.005,
                decay: 0.18,
                sustain: 0,
                release: 0.15
            }
        }).connect(this.masterVolumeNode);
        this.clap.volume.value = -5;

        // 4. Closed Hi-Hat
        this.hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).connect(this.masterVolumeNode);
        this.hihat.volume.value = -12;

        // 5. Open Hi-Hat
        this.openHat = new Tone.MetalSynth({
            envelope: { attack: 0.002, decay: 0.25, release: 0.1 },
            harmonicity: 4.8,
            modulationIndex: 28,
            resonance: 4500,
            octaves: 1.8,
        }).connect(this.masterVolumeNode);
        this.openHat.volume.value = -14;

        // 6. Sliding 808 Sub-Bass
        this.bass808 = new Tone.MonoSynth({
            oscillator: { type: "triangle" },
            envelope: {
                attack: 0.02,
                decay: 0.4,
                sustain: 0.6,
                release: 0.8
            },
            filterEnvelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.2,
                release: 0.5,
                baseFrequency: 55,
                octaves: 3
            }
        }).connect(this.masterVolumeNode);
        this.bass808.volume.value = -3;
        this.bass808.portamento = 0.06;

        // 7. Atmospheric Synth Pad / Chords (Wired through Reverb and Master Volume)
        this.synthPad = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: {
                attack: 0.06,
                decay: 0.9,
                sustain: 0.4,
                release: 1.4
            }
        });
        if (this.reverb) this.synthPad.connect(this.reverb);
        this.synthPad.connect(this.masterVolumeNode);
        this.synthPad.volume.value = -7;

        // 8. Lead Melodic Hook Synth (Wired through Reverb and Master Volume)
        this.leadSynth = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.02,
                decay: 0.25,
                sustain: 0.3,
                release: 0.8
            }
        });
        if (this.reverb) this.leadSynth.connect(this.reverb);
        this.leadSynth.connect(this.masterVolumeNode);
        this.leadSynth.volume.value = -8;

        // 9. Metronome Click
        this.metroClick = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        }).connect(this.masterVolumeNode);
        this.metroClick.volume.value = -10;
    }

    public async loadBeat(beat: Beat): Promise<void> {
        this.currentBeat = beat;
        this.isLoaded = false;
        await this.initAudio(beat);
        Tone.Transport.bpm.value = beat.bpm;
        this.isLoaded = true;
    }

    private startLegacyLoop() {
        if (this.loop) this.loop.dispose();

        const style = this.currentBeat?.style || "trap";

        this.loop = new Tone.Loop((time) => {
            try {
                const t = (offset: string) => time + Tone.Time(offset).toSeconds();

                // Metronome click if enabled
                if (this.metronomeEnabled && this.metroClick) {
                    this.metroClick.triggerAttackRelease("G5", "32n", t("0:0:0"), 0.5);
                    this.metroClick.triggerAttackRelease("C5", "32n", t("0:1:0"), 0.3);
                    this.metroClick.triggerAttackRelease("C5", "32n", t("0:2:0"), 0.3);
                    this.metroClick.triggerAttackRelease("C5", "32n", t("0:3:0"), 0.3);
                }

                // --- 1. TRAP (Menacing 808s, Melodic Flute/Bell Lead, Dark Pad) ---
                if (style === "trap" || style === "grime") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:1:3"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:2"));

                    // Sliding 808
                    this.bass808?.triggerAttackRelease("C1", "4n", t("0:0:0"));
                    this.bass808?.triggerAttackRelease("Ab0", "4n", t("0:2:0"));
                    this.bass808?.triggerAttackRelease("Bb0", "4n", t("0:3:0"));

                    // Snare & Claps on 2 and 4
                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.clap?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));
                    this.clap?.triggerAttackRelease("8n", t("0:3:0"));

                    // Lush Dark Chords
                    this.synthPad?.triggerAttackRelease(["C3", "Eb3", "G3"], "2n", t("0:0:0"));
                    this.synthPad?.triggerAttackRelease(["Ab2", "C3", "Eb3"], "2n", t("0:2:0"));

                    // Melodic Lead Hook (Flute/Bell Arpeggio)
                    this.leadSynth?.triggerAttackRelease("C5", "16n", t("0:0:0"));
                    this.leadSynth?.triggerAttackRelease("Eb5", "16n", t("0:0:2"));
                    this.leadSynth?.triggerAttackRelease("G5", "16n", t("0:1:0"));
                    this.leadSynth?.triggerAttackRelease("F5", "16n", t("0:1:2"));
                    this.leadSynth?.triggerAttackRelease("Eb5", "16n", t("0:2:0"));
                    this.leadSynth?.triggerAttackRelease("C5", "8n", t("0:2:2"));
                    this.leadSynth?.triggerAttackRelease("Bb4", "16n", t("0:3:2"));

                    this.openHat?.triggerAttackRelease("16n", t("0:2:2"), 0.4);

                    for (let i = 0; i < 8; i++) {
                        const b = Math.floor(i / 2);
                        const s = (i % 2) * 2;
                        this.hihat?.triggerAttackRelease("32n", t(`0:${b}:${s}`), 0.35);
                    }
                    this.hihat?.triggerAttackRelease("32n", t("0:3:2"), 0.4);
                    this.hihat?.triggerAttackRelease("32n", t("0:3:3"), 0.4);
                }

                // --- 2. DRILL (Gliding 808s, Dark Brass, Syncopated Snares) ---
                else if (style === "drill") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:1:3"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:2"));

                    this.bass808?.triggerAttackRelease("D1", "4n", t("0:0:0"));
                    this.bass808?.triggerAttackRelease("F1", "8n", t("0:1:2"));
                    this.bass808?.triggerAttackRelease("Eb1", "4n", t("0:2:2"));

                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:2:2"));

                    this.synthPad?.triggerAttackRelease(["D3", "F3", "A3"], "2n", t("0:0:0"));
                    this.synthPad?.triggerAttackRelease(["Bb2", "D3", "F3"], "2n", t("0:2:0"));

                    // Dark Brass Melodic Stabs
                    this.leadSynth?.triggerAttackRelease("D4", "8n", t("0:0:0"));
                    this.leadSynth?.triggerAttackRelease("F4", "8n", t("0:1:1"));
                    this.leadSynth?.triggerAttackRelease("A4", "4n", t("0:2:0"));
                    this.leadSynth?.triggerAttackRelease("G4", "8n", t("0:3:1"));

                    this.hihat?.triggerAttackRelease("32n", t("0:0:0"), 0.4);
                    this.hihat?.triggerAttackRelease("32n", t("0:0:2"), 0.45);
                    this.hihat?.triggerAttackRelease("32n", t("0:1:0"), 0.3);
                    this.hihat?.triggerAttackRelease("32n", t("0:1:2"), 0.45);
                    this.hihat?.triggerAttackRelease("32n", t("0:2:1"), 0.4);
                    this.hihat?.triggerAttackRelease("32n", t("0:3:0"), 0.35);
                    this.hihat?.triggerAttackRelease("32n", t("0:3:2"), 0.45);
                }

                // --- 3. BOOM BAP (Soulful Jazz Piano, Walking Bass, Acoustic Vinyl Swing) ---
                else if (style === "boom-bap") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:1:2"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:1"));

                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));

                    // Jazzy Rhodes chords
                    this.synthPad?.triggerAttackRelease(["F3", "Ab3", "C4", "Eb4"], "2n", t("0:0:0"));
                    this.synthPad?.triggerAttackRelease(["Bb2", "Db3", "F3", "Ab3"], "2n", t("0:2:0"));

                    // Soul Piano Lick
                    this.leadSynth?.triggerAttackRelease("C5", "16n", t("0:0:1"));
                    this.leadSynth?.triggerAttackRelease("Eb5", "16n", t("0:0:3"));
                    this.leadSynth?.triggerAttackRelease("F5", "8n", t("0:1:1"));
                    this.leadSynth?.triggerAttackRelease("Ab5", "16n", t("0:2:1"));
                    this.leadSynth?.triggerAttackRelease("G5", "16n", t("0:2:3"));
                    this.leadSynth?.triggerAttackRelease("F5", "4n", t("0:3:0"));

                    this.bass808?.triggerAttackRelease("F1", "8n", t("0:0:0"));
                    this.bass808?.triggerAttackRelease("Ab1", "8n", t("0:1:2"));
                    this.bass808?.triggerAttackRelease("Bb1", "8n", t("0:2:0"));
                    this.bass808?.triggerAttackRelease("C2", "8n", t("0:3:2"));

                    for (let i = 0; i < 4; i++) {
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:0`), 0.6);
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:2`), 0.35);
                    }
                    this.openHat?.triggerAttackRelease("8n", t("0:1:2"), 0.25);
                }

                // --- 4. WEST COAST BOUNCE (Funk Bassline, G-Synth Whistle, Claps) ---
                else if (style === "west-coast") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:3"));

                    this.clap?.triggerAttackRelease("8n", t("0:1:0"));
                    this.clap?.triggerAttackRelease("8n", t("0:3:0"));

                    this.bass808?.triggerAttackRelease("G1", "8n", t("0:0:0"));
                    this.bass808?.triggerAttackRelease("G1", "8n", t("0:1:1"));
                    this.bass808?.triggerAttackRelease("D1", "8n", t("0:2:0"));
                    this.bass808?.triggerAttackRelease("F1", "8n", t("0:3:1"));

                    this.synthPad?.triggerAttackRelease(["G3", "Bb3", "D4"], "16n", t("0:0:2"));
                    this.synthPad?.triggerAttackRelease(["G3", "Bb3", "D4"], "16n", t("0:1:2"));
                    this.synthPad?.triggerAttackRelease(["F3", "A3", "C4"], "16n", t("0:2:2"));
                    this.synthPad?.triggerAttackRelease(["F3", "A3", "C4"], "16n", t("0:3:2"));

                    // Classic G-Funk Whistle Lead (High Sine)
                    this.leadSynth?.triggerAttackRelease("G5", "4n", t("0:0:0"));
                    this.leadSynth?.triggerAttackRelease("Bb5", "8n", t("0:1:2"));
                    this.leadSynth?.triggerAttackRelease("A5", "8n", t("0:2:0"));
                    this.leadSynth?.triggerAttackRelease("G5", "2n", t("0:2:2"));

                    for (let i = 0; i < 4; i++) {
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:0`), 0.5);
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:2`), 0.3);
                    }
                }

                // --- 5. LOFI / CHILL (Warm Electric Keys, Smooth Neo-Soul Melody) ---
                else {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:1"));

                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));

                    this.synthPad?.triggerAttackRelease(["C3", "E3", "G3", "B3", "D4"], "2n", t("0:0:0"));
                    this.synthPad?.triggerAttackRelease(["A2", "C3", "E3", "G3", "B3"], "2n", t("0:2:0"));

                    // Mellow Lofi Melody
                    this.leadSynth?.triggerAttackRelease("E4", "8n", t("0:0:1"));
                    this.leadSynth?.triggerAttackRelease("G4", "8n", t("0:0:3"));
                    this.leadSynth?.triggerAttackRelease("B4", "4n", t("0:1:1"));
                    this.leadSynth?.triggerAttackRelease("A4", "8n", t("0:2:2"));
                    this.leadSynth?.triggerAttackRelease("E4", "4n", t("0:3:0"));

                    this.bass808?.triggerAttackRelease("C1", "2n", t("0:0:0"));
                    this.bass808?.triggerAttackRelease("A0", "2n", t("0:2:0"));

                    for (let i = 0; i < 4; i++) {
                        this.hihat?.triggerAttackRelease("32n", t(`0:${i}:0`), 0.25);
                        this.hihat?.triggerAttackRelease("32n", t(`0:${i}:2`), 0.18);
                    }
                }
            } catch (e) {
                console.error("Audio Loop Error:", e);
            }
        }, "1m").start(0);
    }

    public async start(): Promise<void> {
        if (!this.isLoaded || !this.currentBeat) return;

        if (Tone.context.state !== "running") {
            await Tone.context.resume();
        }
        await Tone.start();

        Tone.Transport.cancel();
        Tone.Transport.stop();
        Tone.Transport.position = 0;

        if (this.player && this.player.loaded) {
            this.player.unsync();
            this.player.loop = true;
            this.player.start();
        } else {
            this.startLegacyLoop();
        }

        Tone.Transport.start();
        this.isPlaying = true;
    }

    public stop(): void {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        if (this.player) {
            try {
                this.player.stop();
            } catch (e) {
                console.debug("Player stop:", e);
            }
        }
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
        this.isPlaying = false;
    }

    public dispose(): void {
        this.stop();

        if (typeof window !== "undefined") {
            if (this.volumeListener) {
                window.removeEventListener("flowstate_volume_change", this.volumeListener);
                this.volumeListener = null;
            }
            if (this.metronomeListener) {
                window.removeEventListener("flowstate_metronome_change", this.metronomeListener);
                this.metronomeListener = null;
            }
        }

        if (this.player) {
            try {
                this.player.dispose();
            } catch (e) {
                console.debug("Player dispose error:", e);
            }
            this.player = null;
        }

        if (this.masterVolumeNode) {
            try {
                this.masterVolumeNode.dispose();
            } catch (e) {
                console.debug("Volume node dispose error:", e);
            }
        }
    }
}
