export class AudioContextManager {
    private static instance: AudioContextManager;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private micAvailable: boolean = false;

    private constructor() { }

    public static getInstance(): AudioContextManager {
        if (!AudioContextManager.instance) {
            AudioContextManager.instance = new AudioContextManager();
        }
        return AudioContextManager.instance;
    }

    public async initialize(): Promise<void> {
        // Create or resume AudioContext
        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
        }

        if (this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume();
            } catch (err) {
                console.warn("Could not resume AudioContext:", err);
            }
        }

        // Only request mic if not already initialized
        if (this.microphone) return;

        try {
            if (navigator?.mediaDevices?.getUserMedia) {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.8;

                this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
                this.microphone.connect(this.analyser);
                this.micAvailable = true;
            }
        } catch (error) {
            console.warn("Microphone access unavailable or denied. Audio beats will still play.", error);
            this.micAvailable = false;
        }
    }

    public async requestMic(): Promise<boolean> {
        if (this.micAvailable && this.microphone && this.analyser) return true;
        try {
            if (!this.audioContext) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                this.audioContext = new AudioContextClass();
            }
            if (this.audioContext.state === "suspended") {
                await this.audioContext.resume();
            }
            if (navigator?.mediaDevices?.getUserMedia) {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.8;
                this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
                this.microphone.connect(this.analyser);
                this.micAvailable = true;
                return true;
            }
        } catch (err) {
            console.warn("Explicit mic request error:", err);
            this.micAvailable = false;
            return false;
        }
        return false;
    }

    public getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    public getAudioContext(): AudioContext | null {
        return this.audioContext;
    }

    public hasMic(): boolean {
        return this.micAvailable;
    }

    public resumeContext(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(console.warn);
        }
    }
}
