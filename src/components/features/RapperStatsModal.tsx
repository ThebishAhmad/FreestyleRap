import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Crown, Flame, Award, Timer, Sword, Mic, X, RotateCcw, CheckCircle2 } from "lucide-react";

interface RapperStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RapperStatsModal({ isOpen, onClose }: RapperStatsModalProps) {
    const [noPauseBest, setNoPauseBest] = useState<number>(0);
    const [freestyleBest, setFreestyleBest] = useState<number>(0);
    const [battlesWon, setBattlesWon] = useState<number>(0);
    const [totalBattles, setTotalBattles] = useState<number>(0);
    const [punchesLanded, setPunchesLanded] = useState<number>(0);

    const loadStats = () => {
        try {
            const np = localStorage.getItem("flowstate_nopause_best");
            if (np) setNoPauseBest(parseFloat(np) || 0);

            const fs = localStorage.getItem("flowstate_freestyle_best");
            if (fs) setFreestyleBest(parseInt(fs, 10) || 0);

            const bw = localStorage.getItem("flowstate_battles_won");
            if (bw) setBattlesWon(parseInt(bw, 10) || 0);

            const bt = localStorage.getItem("flowstate_battles_total");
            if (bt) setTotalBattles(parseInt(bt, 10) || 0);

            const pl = localStorage.getItem("flowstate_punches_landed");
            if (pl) setPunchesLanded(parseInt(pl, 10) || 0);
        } catch (e) {
            console.debug("Could not read stats from localStorage:", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadStats();
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const resetStats = () => {
        if (window.confirm("Are you sure you want to reset your FlowState career records?")) {
            localStorage.removeItem("flowstate_nopause_best");
            localStorage.removeItem("flowstate_freestyle_best");
            localStorage.removeItem("flowstate_battles_won");
            localStorage.removeItem("flowstate_battles_total");
            localStorage.removeItem("flowstate_punches_landed");
            loadStats();
        }
    };

    // Calculate Rapper Rank Tier
    const getRankTier = () => {
        const scoreSum = freestyleBest + (noPauseBest * 50) + (battlesWon * 500);
        if (scoreSum >= 6000) return { title: "CYPHER GOD", color: "from-amber-400 to-red-500", badge: "DIAMOND", rankNum: 5 };
        if (scoreSum >= 3000) return { title: "BATTLE TITAN", color: "from-purple-400 to-pink-500", badge: "PLATINUM", rankNum: 4 };
        if (scoreSum >= 1500) return { title: "CADENCE MACHINE", color: "from-cyan-400 to-blue-500", badge: "GOLD", rankNum: 3 };
        if (scoreSum >= 500) return { title: "STREET SPITTER", color: "from-emerald-400 to-teal-500", badge: "SILVER", rankNum: 2 };
        return { title: "ROOKIE CADET", color: "from-zinc-400 to-zinc-500", badge: "BRONZE", rankNum: 1 };
    };

    const rank = getRankTier();

    const milestones = [
        {
            title: "Microphone Fiend",
            desc: "Spit over 1,000 points in Freestyle Gym",
            icon: Mic,
            achieved: freestyleBest >= 1000,
        },
        {
            title: "Iron Lungs",
            desc: "Survived 25+ seconds in No-Pause Drill",
            icon: Timer,
            achieved: noPauseBest >= 25,
        },
        {
            title: "Ring Champion",
            desc: "Won an AI Rap Battle tournament",
            icon: Sword,
            achieved: battlesWon >= 1,
        },
        {
            title: "Rhyme Assassin",
            desc: "Landed 10+ target punchlines",
            icon: Flame,
            achieved: punchesLanded >= 10,
        },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#0c0d14] border border-amber-500/30 max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative max-h-[88vh] flex flex-col gap-6 overflow-hidden"
                >
                    {/* Glow Accents */}
                    <div className="absolute top-0 right-1/4 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Crown className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                    Career Dossier
                                </h3>
                                <p className="text-sm text-zinc-300 font-medium mt-0.5">
                                    FlowState Rap Academy Battle & Drill Records
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Current Rank Banner */}
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-between shadow-lg relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-amber-400 shrink-0">
                                <Award className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                    Current Rap Tier
                                </span>
                                <span className="text-2xl font-black text-white tracking-tight mt-0.5">
                                    {rank.title}
                                </span>
                            </div>
                        </div>

                        <div className="text-right relative z-10">
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                                {rank.badge} TIER {rank.rankNum}
                            </span>
                        </div>
                    </div>

                    {/* Core Career Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center flex flex-col items-center justify-center">
                            <Timer className="w-5 h-5 text-amber-400 mb-1.5" />
                            <div className="text-2xl font-black text-white tracking-tight">
                                {noPauseBest > 0 ? `${noPauseBest.toFixed(1)}s` : "--"}
                            </div>
                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mt-1">No-Pause Best</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center flex flex-col items-center justify-center">
                            <Trophy className="w-5 h-5 text-cyan-400 mb-1.5" />
                            <div className="text-2xl font-black text-white tracking-tight">
                                {freestyleBest > 0 ? freestyleBest.toLocaleString() : "--"}
                            </div>
                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mt-1">Freestyle High</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center flex flex-col items-center justify-center">
                            <Sword className="w-5 h-5 text-red-400 mb-1.5" />
                            <div className="text-2xl font-black text-white tracking-tight">
                                {battlesWon} <span className="text-sm font-semibold text-zinc-400">/ {totalBattles}</span>
                            </div>
                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mt-1">Arena Record</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center flex flex-col items-center justify-center">
                            <Flame className="w-5 h-5 text-purple-400 mb-1.5" />
                            <div className="text-2xl font-black text-white tracking-tight">
                                {punchesLanded}
                            </div>
                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mt-1">Punches Hit</span>
                        </div>
                    </div>

                    {/* Milestones & Badges */}
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white tracking-wider uppercase">Academy Milestones</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {milestones.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <div
                                        key={m.title}
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                                            m.achieved
                                                ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                                                : "bg-zinc-900/80 border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className={`p-2.5 rounded-xl ${m.achieved ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/10 text-zinc-300 border border-white/10"}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className={`text-sm font-bold ${m.achieved ? "text-white" : "text-zinc-100"}`}>
                                                    {m.title}
                                                </span>
                                                <span className={`text-xs mt-0.5 leading-normal ${m.achieved ? "text-amber-200/90 font-medium" : "text-zinc-300 font-medium"}`}>
                                                    {m.desc}
                                                </span>
                                            </div>
                                        </div>

                                        {m.achieved ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0 ml-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Unlocked
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-zinc-400 border border-white/10 shrink-0 ml-2">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                        <button
                            onClick={resetStats}
                            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset Records
                        </button>
                        <span className="text-xs text-zinc-400 font-normal">Records saved locally in browser</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

