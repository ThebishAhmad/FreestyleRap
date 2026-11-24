import { RhymeEngine } from "./RhymeEngine";

export interface PunchlineHit {
    type: "counter" | "multi" | "rhyme" | "flow";
    title: string;
    points: number;
    hypeBonus: number;
    matchedWords: string[];
    shouldAirhorn: boolean;
}

export class BattleScorer {
    private rhymeEngine: RhymeEngine;
    private processedWords: Set<string> = new Set();

    constructor() {
        this.rhymeEngine = new RhymeEngine();
    }

    public resetRound() {
        this.processedWords.clear();
    }

    /**
     * Evaluates new words spoken by the user during their turn.
     * Compares against the opponent's trigger word and suggested counter-rhymes.
     */
    public evaluateTranscript(
        transcript: string,
        triggerWord: string,
        suggestions: string[],
        currentCombo: number
    ): PunchlineHit | null {
        if (!transcript.trim()) return null;

        // Clean and tokenize into upper-case words
        const words = transcript
            .toUpperCase()
            .replace(/[^A-Z\s]/g, "")
            .split(/\s+/)
            .filter(w => w.length >= 3);

        if (words.length === 0) return null;

        // Filter only words that haven't already awarded points in this turn
        const newWords = words.filter(w => !this.processedWords.has(w));
        if (newWords.length === 0) return null;

        // Mark them as processed
        newWords.forEach(w => this.processedWords.add(w));

        const upperTarget = triggerWord.toUpperCase();
        const upperSuggestions = suggestions.map(s => s.toUpperCase());

        // 1. Direct Counter check: spoken word is in suggested counter-rhyme list
        const directCounterMatch = newWords.find(w => upperSuggestions.includes(w));
        if (directCounterMatch) {
            const basePoints = 850;
            const comboMultiplier = 1 + (currentCombo * 0.25);
            return {
                type: "counter",
                title: `🎯 DIRECT COUNTER: "${directCounterMatch}"`,
                points: Math.round(basePoints * comboMultiplier),
                hypeBonus: 12,
                matchedWords: [directCounterMatch, upperTarget],
                shouldAirhorn: currentCombo >= 2
            };
        }

        // 2. Rhyme check with opponent's trigger word via RhymeEngine
        const rhymeMatch = newWords.find(w => this.rhymeEngine.isRhyme(w, upperTarget));
        if (rhymeMatch && rhymeMatch !== upperTarget) {
            const basePoints = 600;
            const comboMultiplier = 1 + (currentCombo * 0.2);
            return {
                type: "rhyme",
                title: `💥 PUNCHLINE HIT: "${rhymeMatch}" x "${upperTarget}"`,
                points: Math.round(basePoints * comboMultiplier),
                hypeBonus: 9,
                matchedWords: [rhymeMatch, upperTarget],
                shouldAirhorn: currentCombo >= 3
            };
        }

        // 3. Multi-rhyme check: do any two words in the newly spoken list rhyme with each other?
        for (let i = 0; i < newWords.length; i++) {
            for (let j = i + 1; j < newWords.length; j++) {
                const w1 = newWords[i];
                const w2 = newWords[j];
                if (w1 !== w2 && this.rhymeEngine.isRhyme(w1, w2)) {
                    return {
                        type: "multi",
                        title: `⚡ MULTI-RHYME SCHEME: "${w1}" + "${w2}"`,
                        points: 750 + (currentCombo * 100),
                        hypeBonus: 10,
                        matchedWords: [w1, w2],
                        shouldAirhorn: true
                    };
                }
            }
        }

        // 4. Flow & Word delivery points (every burst of 5 clean words)
        if (newWords.length >= 4) {
            return {
                type: "flow",
                title: `🔥 CLEAN FLOW (+${newWords.length} BARS)`,
                points: 250,
                hypeBonus: 4,
                matchedWords: newWords.slice(-3),
                shouldAirhorn: false
            };
        }

        return null;
    }
}

