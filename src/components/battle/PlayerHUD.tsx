import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Flame, Zap, Send, Sparkles } from "lucide-react";
import { PunchlineHit } from "@/lib/game/BattleScorer";

interface PlayerHUDProps {
    isActive: boolean;
    timeLeft: number;
    maxTime: number;
    score: number;
    combo: number;
    transcript: string;
    targetWord: string;
    counterSuggestions: string[];
    recentHit: PunchlineHit | null;
    isMicAvailable: boolean;
    onManualSubmitBar?: (text: string) => void;
    onSuggestionClick?: (word: string) => void;
}

export function PlayerHUD({
    isActive,
    timeLeft,
    maxTime,
    score,
    combo,
    transcript,
    targetWord,
    counterSuggestions,
    recentHit,
    isMicAvailable,
    onManualSubmitBar,
    onSuggestionClick
}: PlayerHUDProps) {
    const [manualText, setManualText] = useState("");

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualText.trim() && onManualSubmitBar) {
            onManualSubmitBar(manualText.trim());
            setManualText("");
        }
    };

    const progressRatio = Math.max(0, Math.min(1, timeLeft / (maxTime || 12)));

    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 pb-2 z-20">
            {/* Recent Punchline Hit Floating Banner */}
            <AnimatePresence>
                {recentHit && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, y: -10 }}
                        className="mx-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/30 to-amber-500/20 border border-cyan-400 text-white font-mono font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                    >
                        <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                        <span>{recentHit.title}</span>
                        <span className="text-cyan-400">+{recentHit.points} PTS</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Counter Rhyme Word Chips (When user's turn is active) */}
            {isActive && counterSuggestions.length > 0 && (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono uppercase tracking-wider">
                        <span>Target:</span>
                        <span className="text-red-400 font-bold">"{targetWord}"</span>
                        <span className="mx-1">•</span>
                        <span>Rhyme With:</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {counterSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                                className="px-3 py-1 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 font-mono font-bold text-xs hover:bg-cyan-500/30 hover:border-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                title="Click to insert or rap this word!"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main HUD Deck */}
            <div className={`relative rounded-3xl border p-4 md:p-5 backdrop-blur-2xl transition-all duration-300 ${
                isActive
                    ? "bg-black/85 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.18)]"
                    : "bg-black/60 border-white/10"
            }`}>
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Player Score & Combo */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                            Battle Score
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl md:text-3xl font-black font-mono text-white tracking-tight">
                                {score.toLocaleString()}
                            </span>
                            {combo > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-black">
                                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                                    <span>{combo}X</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center: Mic / Countdown Visualizer */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {/* Circular SVG Timer Ring */}
                            {isActive && (
                                <div className="absolute -inset-2 z-0">
                                    <svg className="w-[72px] h-[72px] -rotate-90">
                                        <circle
                                            cx="36" cy="36" r="32"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.08)"
                                            strokeWidth="3.5"
                                        />
                                        <motion.circle
                                            cx="36" cy="36" r="32"
                                            fill="none"
                                            stroke={timeLeft <= 3 ? "#ef4444" : "#06b6d4"}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 1 }}
                                            animate={{ pathLength: progressRatio }}
                                            transition={{ duration: 0.5, ease: "linear" }}
                                            style={{
                                                filter: timeLeft <= 3
                                                    ? "drop-shadow(0 0 8px rgba(239,68,68,0.8))"
                                                    : "drop-shadow(0 0 8px rgba(6,182,212,0.8))"
                                            }}
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Mic Core Button / Indicator */}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all relative z-10 ${
                                isActive
                                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-600"
                            }`}>
                                {isMicAvailable ? (
                                    <Mic className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />
                                ) : (
                                    <MicOff className="w-5 h-5 text-zinc-500" />
                                )}
                            </div>
                        </div>

                        {/* Turn Status / Countdown */}
                        <div className="mt-2 text-center">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                                isActive ? "text-cyan-400" : "text-zinc-500"
                            }`}>
                                {isActive ? "Spit Your Bars" : "Listen"}
                            </span>
                            <span className={`text-sm font-mono font-black ${
                                timeLeft <= 3 && isActive ? "text-red-500 animate-ping" : "text-zinc-300"
                            }`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* Right: Audio Waveform Equalizer (Real-time animated) */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                            Flow Status
                        </span>
                        <div className="flex items-end gap-1 h-8">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                                <motion.div
                                    key={idx}
                                    className={`w-1.5 rounded-full ${
                                        isActive ? "bg-cyan-400" : "bg-zinc-800"
                                    }`}
                                    animate={{
                                        height: isActive
                                            ? [6, Math.min(32, 10 + Math.random() * 22), 6]
                                            : 4
                                    }}
                                    transition={{
                                        duration: 0.35,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        delay: idx * 0.06
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Speech Recognition Transcript Box (User's words appear here!) */}
                {isActive && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                        <div className="min-h-[38px] p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs md:text-sm font-mono text-zinc-300 flex items-center gap-2">
                            <span className="text-cyan-400 font-bold shrink-0">🎤 YOU:</span>
                            <span className="italic truncate">
                                {transcript || "Listening... Rap into your microphone to connect punchlines!"}
                            </span>
                        </div>

                        {/* Text Input Fallback / Keyboard Rap mode */}
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Or type a bar & hit Enter (e.g. 'I took the crown, now watch you drown')..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                            />
                            <button
                                type="submit"
                                disabled={!manualText.trim()}
                                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                            >
                                <Send className="w-3 h-3" /> Fire
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
