export interface Rhyme {
    word: string;
    score: number;
    numSyllables: number;
}

export type RhymeType = 'perfect' | 'near';

export class RhymeEngine {
    private static BASE_URL = "https://api.datamuse.com/words";

    static async getRhymes(word: string): Promise<Rhyme[]> {
        try {
            const response = await fetch(`${this.BASE_URL}?rel_rhy=${word}&max=50`);
            if (!response.ok) throw new Error("Failed to fetch rhymes");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("RhymeEngine Error:", error);
            return [];
        }
    }

    static async getNearRhymes(word: string): Promise<Rhyme[]> {
        try {
            // rel_nry = Near rhymes
            const response = await fetch(`${this.BASE_URL}?rel_nry=${word}&max=50`);
            if (!response.ok) throw new Error("Failed to fetch near rhymes");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("RhymeEngine Error:", error);
            return [];
        }
    }

    // Helper to categorize or filter
    static filterBySyllables(rhymes: Rhyme[], min: number, max: number) {
        return rhymes.filter(r => r.numSyllables >= min && r.numSyllables <= max);
    }
}
