import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface CinematicLyricsProps {
    text: string;
    isActive: boolean;
    speakerName?: string;
    accentColor?: string;
}

export function CinematicLyrics({
    text,
    isActive,
    speakerName = "OPPONENT",
    accentColor = "text-red-500"
}: CinematicLyricsProps) {
    if (!text) return null;

    // Split text into bars (divided by " / " or newlines)
    const lines = text
        .split(/\s*\/\s*|\n+/)
        .map(l => l.trim())
        .filter(Boolean);

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[160px] relative px-4">
            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div
                        key={text}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15, filter: "blur(6px)" }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col items-center gap-3 text-center"
                    >
                        {/* Speaker Indicator */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                                {speakerName} DROPPING BARS
                            </span>
                        </div>

                        {lines.map((line, idx) => {
                            // Extract words to highlight the final rhyming word
                            const words = line.split(" ");
                            const mainWords = words.slice(0, -1).join(" ");
                            const endWord = words[words.length - 1] || "";

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.94, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: idx * 0.45,
                                        duration: 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="relative group"
                                >
                                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                                        "{mainWords}{" "}
                                        <span className={`inline-block font-black underline decoration-2 decoration-red-500/60 ${accentColor} drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]`}>
                                            {endWord}
                                        </span>"
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
