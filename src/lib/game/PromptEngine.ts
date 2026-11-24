import rawWords from "@/data/words.json";

export interface PromptResult {
    word: string;
    rhymes: string[];
    category: string;
    difficulty: "beginner" | "intermediate" | "master";
    syllables: number;
}

export class PromptEngine {
    private topics = [
        "Street Culture & City Nights",
        "Cyberpunk & AI Infiltration",
        "Hustle, Wealth & Ambition",
        "Mic Supremacy & Battle Dominance",
        "Philosophical Metaphors",
        "Underground Cypher & Raw Flow",
        "Cosmic Frontiers & Time Travel",
        "Speed, Adrenaline & Fast Lanes",
        "Golden Era Hip-Hop Homage",
        "Villain Arc & Dark Alter Ego"
    ];

    private curatedWords: Array<{ word: string; category: string; difficulty: "beginner" | "intermediate" | "master"; syllables: number; rhymes: string[] }> = [
        // Beginner (1 syllable, punchy)
        { word: "FIRE", category: "Elements", difficulty: "beginner", syllables: 1, rhymes: ["Wire", "Desire", "Empire", "Higher"] },
        { word: "CROWN", category: "Battle", difficulty: "beginner", syllables: 1, rhymes: ["Drown", "Down", "Renown", "Sound"] },
        { word: "TRAP", category: "Street", difficulty: "beginner", syllables: 1, rhymes: ["Rap", "Map", "Snap", "Clap"] },
        { word: "BEAT", category: "Music", difficulty: "beginner", syllables: 1, rhymes: ["Heat", "Street", "Fleet", "Defeat"] },
        { word: "FLOW", category: "Music", difficulty: "beginner", syllables: 1, rhymes: ["Glow", "Blow", "Slow", "Below"] },
        { word: "BLOCK", category: "Street", difficulty: "beginner", syllables: 1, rhymes: ["Clock", "Lock", "Shock", "Rock"] },
        { word: "GLITCH", category: "Cyber", difficulty: "beginner", syllables: 1, rhymes: ["Switch", "Rich", "Stitch", "Pitch"] },
        { word: "TIME", category: "Life", difficulty: "beginner", syllables: 1, rhymes: ["Rhyme", "Climb", "Prime", "Chime"] },
        { word: "GRIND", category: "Hustle", difficulty: "beginner", syllables: 1, rhymes: ["Mind", "Blind", "Find", "Designed"] },
        { word: "SHADOW", category: "Mystery", difficulty: "beginner", syllables: 2, rhymes: ["Gallows", "Follow", "Hollow", "Shallow"] },
        { word: "ZONE", category: "Mindset", difficulty: "beginner", syllables: 1, rhymes: ["Throne", "Stone", "Blown", "Alone"] },
        { word: "STEEL", category: "Strength", difficulty: "beginner", syllables: 1, rhymes: ["Real", "Deal", "Heal", "Appeal"] },
        { word: "COLD", category: "Elements", difficulty: "beginner", syllables: 1, rhymes: ["Gold", "Bold", "Hold", "Controlled"] },
        { word: "LIGHT", category: "Elements", difficulty: "beginner", syllables: 1, rhymes: ["Night", "Fight", "Height", "Ignite"] },
        { word: "SMOKE", category: "Street", difficulty: "beginner", syllables: 1, rhymes: ["Choke", "Broke", "Provoke", "Evoke"] },
        { word: "GAME", category: "Hustle", difficulty: "beginner", syllables: 1, rhymes: ["Fame", "Name", "Flame", "Claim"] },

        // Intermediate (2-3 syllables, dynamic & metaphoric)
        { word: "GRAVITY", category: "Science", difficulty: "intermediate", syllables: 3, rhymes: ["Cavity", "Depravity", "Tragedy", "Capacity"] },
        { word: "CIRCUIT", category: "Cyber", difficulty: "intermediate", syllables: 2, rhymes: ["Worth it", "Earth quit", "Surplus", "Purpose"] },
        { word: "PHANTOM", category: "Mystery", difficulty: "intermediate", syllables: 2, rhymes: ["Ransom", "Tandem", "Random", "Handsome"] },
        { word: "VOLTAGE", category: "Cyber", difficulty: "intermediate", syllables: 2, rhymes: ["Hostage", "Postage", "Blockage", "Shortage"] },
        { word: "DYNASTY", category: "Empire", difficulty: "intermediate", syllables: 3, rhymes: ["Majesty", "Tragedy", "Mastery", "Fast as me"] },
        { word: "MATRIX", category: "Cyber", difficulty: "intermediate", syllables: 2, rhymes: ["Basics", "Play tricks", "Great hits", "Stasis"] },
        { word: "CYCLONE", category: "Nature", difficulty: "intermediate", syllables: 2, rhymes: ["Milestone", "Fly home", "Mind blown", "Life zone"] },
        { word: "CHAMPION", category: "Battle", difficulty: "intermediate", syllables: 3, rhymes: ["Companion", "Canyon", "Expansion", "Mansion"] },
        { word: "ELEVATE", category: "Elevation", difficulty: "intermediate", syllables: 3, rhymes: ["Hesitate", "Regulate", "Demonstrate", "Generate"] },
        { word: "IGNITION", category: "Power", difficulty: "intermediate", syllables: 3, rhymes: ["Condition", "Ambition", "Position", "Transition"] },
        { word: "HORIZON", category: "Space", difficulty: "intermediate", syllables: 3, rhymes: ["Arisen", "Prison", "Precision", "Vision"] },
        { word: "RECKLESS", category: "Street", difficulty: "intermediate", syllables: 2, rhymes: ["Necklace", "Senseless", "Helpless", "Endless"] },
        { word: "TITANIUM", category: "Strength", difficulty: "intermediate", syllables: 4, rhymes: ["Uranium", "Cranium", "Spontaneous", "Stadium"] },
        { word: "PRESSURE", category: "Mental", difficulty: "intermediate", syllables: 2, rhymes: ["Measure", "Treasure", "Pleasure", "Lesser"] },
        { word: "VENOM", category: "Danger", difficulty: "intermediate", syllables: 2, rhymes: ["Denim", "Men in", "End them", "Send them"] },
        { word: "OUTLAW", category: "Rebel", difficulty: "intermediate", syllables: 2, rhymes: ["Southpaw", "Lockjaw", "Flaw", "Saw"] },

        // Master (3-5 syllables, multi-rhyme heavy)
        { word: "METAMORPHOSIS", category: "Science", difficulty: "master", syllables: 5, rhymes: ["Diagnosis is", "Hypnosis is", "Prognosis is", "Neurosis is"] },
        { word: "SUPREMACY", category: "Battle", difficulty: "master", syllables: 4, rhymes: ["Legacy", "Jealousy", "Telepathy", "Remedy"] },
        { word: "ILLUMINATION", category: "Mind", difficulty: "master", syllables: 5, rhymes: ["Domination", "Calculation", "Manifestation", "Celebration"] },
        { word: "APOCALYPSE", category: "Dark", difficulty: "master", syllables: 4, rhymes: ["Paralysis", "Analysis", "Eclipse", "Black ships"] },
        { word: "UNTOUCHABLE", category: "Skill", difficulty: "master", syllables: 4, rhymes: ["Uncrushable", "Stoppable", "Formidable", "Incurable"] },
        { word: "DEVASTATION", category: "Battle", difficulty: "master", syllables: 4, rhymes: ["Dedication", "Elevation", "Inspiration", "Demonstration"] },
        { word: "REVOLUTIONARY", category: "Rebel", difficulty: "master", syllables: 6, rhymes: ["Visionary", "Dictionary", "Military", "Legendary"] },
        { word: "ACCELERATION", category: "Speed", difficulty: "master", syllables: 5, rhymes: ["Determination", "Generation", "Preparation", "Observation"] },
        { word: "TELEPATHY", category: "Mind", difficulty: "master", syllables: 4, rhymes: ["Energy", "Enemy", "Identity", "Memory"] },
        { word: "PHENOMENAL", category: "Skill", difficulty: "master", syllables: 4, rhymes: ["Astronomical", "Economical", "Unorthodox", "Chronicle"] }
    ];

    public getTopic(): string {
        return this.topics[Math.floor(Math.random() * this.topics.length)];
    }

    public getWord(difficulty?: "all" | "beginner" | "intermediate" | "master", category?: string): string {
        const item = this.getWordWithRhymes(difficulty, category);
        return item.word;
    }

    public getWords(count: number): string[] {
        const shuffled = [...this.curatedWords].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(w => w.word);
    }

    public getWordWithRhymes(
        difficulty?: string,
        category?: string
    ): PromptResult {
        let pool = this.curatedWords;

        if (difficulty && difficulty !== "all") {
            const filtered = pool.filter(w => w.difficulty === difficulty);
            if (filtered.length > 0) pool = filtered;
        }

        if (category && category !== "all") {
            const catFiltered = pool.filter(w => w.category.toLowerCase() === category.toLowerCase());
            if (catFiltered.length > 0) pool = catFiltered;
        }

        const picked = pool[Math.floor(Math.random() * pool.length)];

        // Also check if words.json has additional rhyme partners
        const extraRhymes = this.getRhymesFromRawDict(picked.word);
        const combinedRhymes = Array.from(new Set([...picked.rhymes, ...extraRhymes])).slice(0, 4);

        return {
            word: picked.word,
            rhymes: combinedRhymes,
            category: picked.category,
            difficulty: picked.difficulty,
            syllables: picked.syllables
        };
    }

    public getRhymesForWord(word: string): string[] {
        const clean = word.toUpperCase().trim();
        const found = this.curatedWords.find(w => w.word.toUpperCase() === clean);
        if (found) return found.rhymes;

        return this.getRhymesFromRawDict(clean);
    }

    private getRhymesFromRawDict(cleanWord: string): string[] {
        const dict = rawWords as Record<string, string[]>;
        for (const list of Object.values(dict)) {
            const upperList = list.map(w => w.toUpperCase());
            if (upperList.includes(cleanWord)) {
                return upperList.filter(w => w !== cleanWord).slice(0, 4);
            }
        }
        return ["Flow", "Glow", "Know", "Show"];
    }

    public getCounterRhymes(roastText: string): { triggerWord: string; suggestions: string[] } {
        const words = roastText
            .toUpperCase()
            .replace(/[^A-Z\s]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 2);

        // Look at the last word or prominent rhyme word in roast
        const target = words[words.length - 1] || "CLOWN";
        const rhymes = this.getRhymesForWord(target);

        return {
            triggerWord: target,
            suggestions: rhymes.length > 0 ? rhymes : ["Crown", "Down", "Drown", "Renown"]
        };
    }
}
