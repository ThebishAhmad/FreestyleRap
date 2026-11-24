import { motion } from "framer-motion";
import { Users, Flame } from "lucide-react";

interface EnergyBarProps {
    aiEnergy: number; // 0-100
    userEnergy: number; // 0-100
    opponentName?: string;
}

export function EnergyBar({ aiEnergy, userEnergy, opponentName = "AI" }: EnergyBarProps) {
    // Balance between 0 (complete AI control) and 100 (complete User dominance)
    const balance = Math.min(95, Math.max(5, userEnergy));

    // Crowd Mood string based on user's current energy / hype
    let crowdMood = "NEUTRAL CYC";
    let crowdMoodColor = "text-zinc-400 border-zinc-700";

    if (userEnergy < 30) {
        crowdMood = "CROWD RESTLESS ⚠️";
        crowdMoodColor = "text-red-400 border-red-500/40 bg-red-950/40";
    } else if (userEnergy < 50) {
        crowdMood = "ARENA TENSE ⚡";
        crowdMoodColor = "text-amber-400 border-amber-500/40 bg-amber-950/40";
    } else if (userEnergy < 75) {
        crowdMood = "CROWD HYPED 🔥";
        crowdMoodColor = "text-cyan-400 border-cyan-500/40 bg-cyan-950/40";
    } else {
        crowdMood = "ARENA ROARING 💥";
        crowdMoodColor = "text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/40";
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-1.5 px-4">
            {/* Top Stat Labels */}
            <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider">
                <div className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{opponentName}: {Math.round(100 - userEnergy)}%</span>
                </div>

                {/* Central Crowd Mood Pill */}
                <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-black uppercase flex items-center gap-1 backdrop-blur-md ${crowdMoodColor}`}>
                    <Users className="w-3 h-3" />
                    <span>{crowdMood}</span>
                </div>

                <div className="flex items-center gap-1.5 text-cyan-400">
                    <span>YOU: {Math.round(userEnergy)}%</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
            </div>

            {/* Tug-of-war Bar Track */}
            <div className="w-full h-2.5 bg-zinc-950/90 rounded-full overflow-hidden relative backdrop-blur-md border border-white/10 shadow-inner">
                {/* Center 50% Divider Marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/40 z-20 -translate-x-1/2" />

                {/* AI / Left Side (Red) */}
                <motion.div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-400 z-10"
                    animate={{ width: `${100 - balance}%` }}
                    transition={{ type: "spring", damping: 18, stiffness: 120 }}
                />

                {/* Player / Right Side (Cyan) */}
                <motion.div
                    className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-cyan-500 via-blue-500 to-teal-400 z-10"
                    animate={{ width: `${balance}%` }}
                    transition={{ type: "spring", damping: 18, stiffness: 120 }}
                />

                {/* Glowing Collision Head */}
                <motion.div
                    className="absolute top-0 bottom-0 w-3 bg-white blur-[3px] z-30 -translate-x-1/2 mix-blend-overlay"
                    style={{ left: `${100 - balance}%` }}
                />
            </div>
        </div>
    );
}
