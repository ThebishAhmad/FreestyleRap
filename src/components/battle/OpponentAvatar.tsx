import { motion, AnimatePresence } from "framer-motion";
import { Skull, Crown, Ghost, ShieldAlert, Cpu, Radio, Sparkles } from "lucide-react";
import { OpponentPersona } from "@/data/battleOpponents";

interface OpponentAvatarProps {
    opponent: OpponentPersona;
    isActive: boolean;
    isStunned?: boolean;
    isDefeated?: boolean;
    speechStatus?: string;
}

export function OpponentAvatar({
    opponent,
    isActive,
    isStunned = false,
    isDefeated = false,
    speechStatus
}: OpponentAvatarProps) {
    const isCyber = opponent.id === "cyber";
    const isBoom = opponent.id === "boom";
    const isDrill = opponent.id === "drill";

    // Primary and glowing styling based on opponent
    const themeGlow = isCyber
        ? "bg-red-600 shadow-red-500/50"
        : isBoom
            ? "bg-amber-600 shadow-amber-500/50"
            : "bg-cyan-500 shadow-cyan-400/50";

    const borderColor = isCyber
        ? "border-red-500"
        : isBoom
            ? "border-amber-500"
            : "border-cyan-400";

    const accentTextColor = isCyber
        ? "text-red-500"
        : isBoom
            ? "text-amber-400"
            : "text-cyan-400";

    return (
        <div className="relative flex flex-col items-center justify-center select-none">
            {/* Stun / Punchline hit toast on opponent */}
            <AnimatePresence>
                {isStunned && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -20, scale: 1.1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="absolute -top-12 z-30 px-3 py-1 rounded-full bg-red-600 text-white font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.9)] flex items-center gap-1.5"
                    >
                        <ShieldAlert className="w-3.5 h-3.5 animate-bounce" /> CRITICAL HIT!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar Head Unit */}
            <div className="relative w-36 h-36 md:w-48 md:h-48">
                {/* Background Ambient Glow Ring */}
                <motion.div
                    animate={{
                        scale: isActive ? [1, 1.14, 1] : isStunned ? [1.2, 0.95] : 1,
                        opacity: isActive ? [0.6, 0.9, 0.6] : 0.25,
                    }}
                    transition={{ duration: isActive ? 1.4 : 0.2, repeat: isActive ? Infinity : 0 }}
                    className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                        isDefeated ? "bg-zinc-800" : themeGlow
                    }`}
                />

                {/* Outer Ring with Cyber Tech Details */}
                <div
                    className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
                        isActive
                            ? `${borderColor} shadow-[0_0_30px_rgba(255,255,255,0.2)]`
                            : "border-zinc-800/80 bg-black/40"
                    }`}
                />

                {/* Inner Faceplate Container */}
                <motion.div
                    animate={
                        isStunned
                            ? { x: [-8, 8, -6, 6, 0], y: [-4, 4, 0], rotate: [-4, 4, -2, 0] }
                            : isActive
                                ? { scale: [1, 1.04, 1], y: [0, -3, 0] }
                                : {}
                    }
                    transition={{
                        duration: isStunned ? 0.35 : 0.8,
                        repeat: isActive && !isStunned ? Infinity : 0,
                        repeatType: "reverse"
                    }}
                    className={`
                        absolute inset-2 rounded-full flex flex-col items-center justify-center 
                        border-2 overflow-hidden backdrop-blur-xl transition-all duration-300
                        ${isActive ? `${borderColor} bg-black/90` : "border-zinc-800 bg-zinc-950/90"}
                        ${isDefeated ? "border-zinc-800 opacity-40 grayscale" : ""}
                    `}
                >
                    {/* Background Digital Grid / Texture */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:10px_10px] opacity-40 pointer-events-none" />

                    {/* Opponent Specific Center Icon */}
                    <div className="relative z-10">
                        {isCyber && (
                            <div className="relative">
                                <Skull
                                    className={`w-16 h-16 md:w-20 md:h-20 transition-colors duration-300 ${
                                        isActive
                                            ? "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]"
                                            : "text-zinc-600"
                                    }`}
                                />
                                {isActive && (
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                        className="absolute top-6 left-3 right-3 h-1.5 bg-red-400 blur-[1px] rounded-full"
                                    />
                                )}
                            </div>
                        )}

                        {isBoom && (
                            <div className="relative flex flex-col items-center">
                                <Crown
                                    className={`w-10 h-10 -mb-2 transition-colors duration-300 ${
                                        isActive
                                            ? "text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                                            : "text-zinc-600"
                                    }`}
                                />
                                <Radio
                                    className={`w-14 h-14 md:w-16 md:h-16 transition-colors duration-300 ${
                                        isActive
                                            ? "text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
                                            : "text-zinc-600"
                                    }`}
                                />
                            </div>
                        )}

                        {isDrill && (
                            <div className="relative">
                                <Ghost
                                    className={`w-16 h-16 md:w-20 md:h-20 transition-colors duration-300 ${
                                        isActive
                                            ? "text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.9)]"
                                            : "text-zinc-600"
                                    }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Active Audio / Vocalizer Bars at bottom of avatar */}
                    {isActive && (
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 z-10 px-6">
                            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                                <motion.div
                                    key={bar}
                                    className={`w-1 rounded-full ${
                                        isCyber ? "bg-red-500" : isBoom ? "bg-amber-400" : "bg-cyan-400"
                                    }`}
                                    animate={{ height: [4, Math.random() * 18 + 6, 4] }}
                                    transition={{
                                        duration: 0.35,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        delay: bar * 0.05
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Speaking Shockwaves (When active) */}
                {isActive && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className={`absolute inset-0 rounded-full border ${borderColor}`}
                                initial={{ opacity: 0.8, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.6 }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Nameplate & Status */}
            <div className="mt-4 flex flex-col items-center gap-1.5">
                {speechStatus && (
                    <span className="text-xs font-semibold text-zinc-300 animate-pulse px-3 py-0.5 rounded-full bg-white/10 border border-white/10">
                        {speechStatus}
                    </span>
                )}

                <h3
                    className={`text-2xl md:text-3xl font-black uppercase tracking-tight transition-colors ${
                        isActive ? "text-white" : "text-zinc-500"
                    }`}
                >
                    {opponent.name}
                </h3>

                <p className="text-sm text-zinc-300 max-w-xs text-center truncate">
                    {opponent.title}
                </p>
            </div>
        </div>
    );
}
