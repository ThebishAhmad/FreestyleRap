import { DEFAULT_WORD_PACK, type Word, type WordPack } from "@/lib/game/WordPack";

export interface PatternConfig {
    id: string;
    name: string;
    slots: string[]; // ["A", "A", "B", "B"]
    description?: string;
}

export const PATTERNS: Record<string, PatternConfig> = {
    "AABB": { id: "AABB", name: "Couplets", slots: ["A", "A", "B", "B"], description: "Classic pairs of rhyming lines. Ideal for punchlines." },
    "ABAB": { id: "ABAB", name: "Alternate", slots: ["A", "B", "A", "B"], description: "Interlocking cross rhymes for dynamic storytelling." },
    "AAAA": { id: "AAAA", name: "Monorhyme", slots: ["A", "A", "A", "A"], description: "Four-bar single sound barrage for relentless flow." },
    "ABBA": { id: "ABBA", name: "Enclosed", slots: ["A", "B", "B", "A"], description: "Outer lines frame an inner couplet for sophisticated closure." },
};

export const COLOR_MAP: Record<string, string> = {
    "A": "#F97316", // Orange
    "B": "#06B6D4", // Cyan
    "C": "#A855F7", // Purple
    "D": "#EAB308", // Yellow
};

interface RhymeTarget {
    vowel: string;
    words: Word[];
}

export class PatternEngine {
    private currentPattern: PatternConfig = PATTERNS["AABB"];
    private currentPack: WordPack = DEFAULT_WORD_PACK;

    // Cache targets per 4-bar stanza: stanzaIndex -> { "A": RhymeTarget, "B": RhymeTarget }
    private stanzaVowelCache: Record<number, Record<string, RhymeTarget>> = {};

    // Cache words by global absolute bar index (0-indexed)
    private barWordCache: Record<number, Word> = {};

    // Track recently used vowel IDs to prevent consecutive stanzas from picking the same sounds
    private recentVowels: string[] = [];

    // Track all words used during the current session to guarantee zero word repetition
    private usedWordsInSession: Set<string> = new Set();

    constructor() {
        this.reset();
    }

    public setPattern(patternId: string) {
        if (PATTERNS[patternId]) {
            this.currentPattern = PATTERNS[patternId];
        } else {
            console.warn(`Pattern ${patternId} not found, defaulting to AABB`);
            this.currentPattern = PATTERNS["AABB"];
        }
        this.reset();
    }

    public setPack(pack: WordPack) {
        this.currentPack = pack;
        this.reset();
    }

    public getPattern(): PatternConfig {
        return this.currentPattern;
    }

    public reset() {
        this.barWordCache = {};
        this.stanzaVowelCache = {};
        this.recentVowels = [];
        this.usedWordsInSession.clear();
    }

    /**
     * Retrieves all available vowel keys that have at least 4 words in the pack
     */
    private getAvailableVowelKeys(): string[] {
        if (!this.currentPack || !this.currentPack.rhyme_map) return [];
        return Object.keys(this.currentPack.rhyme_map).filter(
            (k) => this.currentPack.rhyme_map[k] && this.currentPack.rhyme_map[k].length >= 3
        );
    }

    /**
     * Pick a random rhyme target that hasn't been used recently
     */
    private getFreshRhymeTarget(excludedVowelsInStanza: Set<string>): RhymeTarget {
        const allKeys = this.getAvailableVowelKeys();
        if (allKeys.length === 0) {
            return { vowel: "AE-AP", words: [] };
        }

        // Filter out vowels used in this stanza and recent stanzas
        const candidates = allKeys.filter(
            (k) => !excludedVowelsInStanza.has(k) && !this.recentVowels.includes(k)
        );

        const pool = candidates.length > 0 ? candidates : allKeys.filter((k) => !excludedVowelsInStanza.has(k));
        const finalPool = pool.length > 0 ? pool : allKeys;

        const pickedKey = finalPool[Math.floor(Math.random() * finalPool.length)];

        // Record into sliding history of last 8 used vowel sounds
        this.recentVowels.push(pickedKey);
        if (this.recentVowels.length > 8) {
            this.recentVowels.shift();
        }

        return {
            vowel: pickedKey,
            words: this.currentPack.rhyme_map[pickedKey] || []
        };
    }

    /**
     * Computes or retrieves unique rhyme vowel targets for each 4-bar stanza block
     */
    private getVowelsForStanza(stanzaIndex: number): Record<string, RhymeTarget> {
        if (this.stanzaVowelCache[stanzaIndex]) {
            return this.stanzaVowelCache[stanzaIndex];
        }

        const uniqueGroups = Array.from(new Set(this.currentPattern.slots));
        const stanzaVowels: Record<string, RhymeTarget> = {};
        const usedInThisStanza = new Set<string>();

        uniqueGroups.forEach((group) => {
            const target = this.getFreshRhymeTarget(usedInThisStanza);
            usedInThisStanza.add(target.vowel);
            stanzaVowels[group] = target;
        });

        this.stanzaVowelCache[stanzaIndex] = stanzaVowels;
        return stanzaVowels;
    }

    private shuffleArray<T>(array: T[]): T[] {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    /**
     * Selects a fresh word for a target, guaranteeing zero repetition in the session
     */
    private getNextWord(target: RhymeTarget): Word {
        const rhymeWords = target.words || [];

        // 1. Try to find words in this rhyme family that haven't been used yet in this session
        const unusedWords = rhymeWords.filter((w) => !this.usedWordsInSession.has(w.word.toUpperCase()));

        let selectedWord: Word;
        if (unusedWords.length > 0) {
            // Pick randomly from unused words
            selectedWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
        } else if (rhymeWords.length > 0) {
            // If all words in this family were already exhausted, pick any random one
            selectedWord = rhymeWords[Math.floor(Math.random() * rhymeWords.length)];
        } else {
            // Fallback word
            selectedWord = { word: "CROWN", syllable_count: 1, phonetic_rhyme_id: target.vowel, tags: [] };
        }

        // Mark as used in session
        this.usedWordsInSession.add(selectedWord.word.toUpperCase());
        return selectedWord;
    }

    /**
     * Returns the rhyme word and metadata for a specific global bar (0-indexed)
     */
    private getWordForBar(barIndex: number): Word {
        if (this.barWordCache[barIndex]) {
            return this.barWordCache[barIndex];
        }

        const patternLength = this.currentPattern.slots.length; // e.g. 4 bars per stanza
        const stanzaIndex = Math.floor(barIndex / patternLength);
        const slotIndex = barIndex % patternLength;
        const group = this.currentPattern.slots[slotIndex];

        // Each 4-bar stanza gets its own fresh vowel targets!
        const stanzaVowels = this.getVowelsForStanza(stanzaIndex);
        const target = stanzaVowels[group];

        const word = this.getNextWord(target);
        this.barWordCache[barIndex] = word;
        return word;
    }

    /**
     * API consumed by PatternDrill UI to render the 4th beat rhyme tile
     */
    public getContentForBar(globalBarIndex: number): {
        vowel: string;
        label: string;
        suggestion: string;
        color: string;
    } {
        const word = this.getWordForBar(globalBarIndex);

        const patternLength = this.currentPattern.slots.length;
        const stanzaIndex = Math.floor(globalBarIndex / patternLength);
        const slotIndex = globalBarIndex % patternLength;
        const group = this.currentPattern.slots[slotIndex];

        const stanzaVowels = this.getVowelsForStanza(stanzaIndex);
        const vowel = stanzaVowels[group]?.vowel || "RHYME";

        return {
            vowel,
            label: group,
            suggestion: word.word,
            color: COLOR_MAP[group] || "#06B6D4"
        };
    }
}
