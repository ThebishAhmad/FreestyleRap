export type PromptType = 'word' | 'emotion' | 'scene' | 'topic';

export interface Prompt {
    type: PromptType;
    text: string;
}

export class PromptEngine {
    private static WORDS = [
        "Resilience", "Empire", "Shadow", "Velocity", "Algorithm", "Concrete", "Horizon",
        "Legacy", "Circuit", "Phantom", "Gravity", "Echo", "Titan", "Orbit"
    ];

    private static EMOTIONS = [
        "Aggressive", "Melancholy", "Triumphant", "Paranoid", "Chill", "Manic", "Nostalgic"
    ];

    private static SCENES = [
        "Robbing a bank in 3024",
        "Last person on Mars",
        "Winning the lottery but losing your soul",
        "Running from the police in a cyberpunk city",
        "Cooking breakfast while the house burns"
    ];

    private static TOPICS = [
        "Politics", "Technology", "Childhood", "Money", "Haters", "Success", "The Future"
    ];

    static getPrompt(type: PromptType = 'word'): Prompt {
        let list: string[] = [];
        switch (type) {
            case 'word': list = this.WORDS; break;
            case 'emotion': list = this.EMOTIONS; break;
            case 'scene': list = this.SCENES; break;
            case 'topic': list = this.TOPICS; break;
        }
        const text = list[Math.floor(Math.random() * list.length)];
        return { type, text };
    }
}
