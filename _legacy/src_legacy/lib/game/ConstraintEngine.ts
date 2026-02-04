export class ConstraintEngine {
    private recognition: any = null;
    private isListening = false;
    private onResult: (text: string) => void;

    constructor(onResult: (text: string) => void) {
        this.onResult = onResult;
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';

                this.recognition.onresult = (event: any) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            this.onResult(event.results[i][0].transcript);
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                };

                this.recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                };
            }
        }
    }

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
            } catch (e) {
                console.error("Error starting recognition", e);
            }
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Heuristic Checks
    static checkConstraint(text: string, constraint: string): boolean {
        const normalize = (s: string) => s.toLowerCase();

        // Example: "No A sounds" -> Very hard to check phonetically without a dictionary, 
        // but we can check if they used words containing 'a' (simplified).
        if (constraint === "No 'A' words") {
            return !normalize(text).includes('a');
        }

        // Example: "Must rhyme with Cat" (Simplified to ends with 'at')
        if (constraint.startsWith("Rhyme with")) {
            // Logic for rhyme check would go here
            return true;
        }

        return true;
    }
}
