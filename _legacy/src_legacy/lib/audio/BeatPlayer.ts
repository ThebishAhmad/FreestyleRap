import * as Tone from "tone";

export interface Beat {
    id: string;
    name: string;
    url: string;
    bpm: number;
}

export class BeatPlayer {
    private player: Tone.Player | null = null;
    private currentBeat: Beat | null = null;
    private isLoaded: boolean = false;

    constructor() {
        // Initialize Tone.js context if needed, usually auto-handled but good to be explicit on play
    }

    public async loadBeat(beat: Beat): Promise<void> {
        if (this.player) {
            this.player.dispose();
        }

        this.currentBeat = beat;
        this.isLoaded = false;

        // Use Tone.Player specifically
        // Ensure that the URL is accessible or use a local file for now.
        // For MVP we might need to rely on standard HTML5 Audio if Tone has CORS issues with random URLs?
        // But Tone.Player is better for BPM sync later.

        return new Promise((resolve, reject) => {
            this.player = new Tone.Player({
                url: beat.url,
                loop: true,
                autostart: false,
                onload: () => {
                    this.isLoaded = true;
                    resolve();
                },
                onerror: (err) => {
                    console.error("Error loading beat", err);
                    reject(err);
                }
            }).toDestination();
        });
    }

    public start(): void {
        if (this.player && this.isLoaded) {
            Tone.start(); // Ensure context is started
            this.player.start();
        }
    }

    public stop(): void {
        if (this.player) {
            this.player.stop();
        }
    }

    public setVolume(db: number): void {
        if (this.player) {
            this.player.volume.value = db;
        }
    }

    public getIsLoaded(): boolean {
        return this.isLoaded;
    }
}
