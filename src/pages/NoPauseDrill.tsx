import { useState, useRef, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { ArenaAudio } from "@/lib/audio/ArenaAudio";
import { PromptEngine, PromptResult } from "@/lib/game/PromptEngine";
import { useBeat } from "@/contexts/BeatContext";
import { triggerSettings } from "@/components/features/SettingsPanel";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Zap,
    AlertOctagon,
    Trophy,
    Flame,
    Music2,
    RefreshCw,
    Volume2,
    VolumeX,
    ShieldAlert,
    Clock,
    Sparkles,
    Radio,
    Mic,
    Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeControl } from "@/components/features/VolumeControl";

export default function NoPauseDrill() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeSurvived, setTimeSurvived] = useState(0);
    const [highScore, setHighScore] = useState<number>(() => {
        return parseFloat(localStorage.getItem("flowstate_nopause_best") || "0");
    });
    const [silenceTolerance, setSilenceTolerance] = useState<number>(900); // 900ms standard
    const [currentPrompt, setCurrentPrompt] = useState<PromptResult | null>(null);
    const [upcomingPrompts, setUpcomingPrompts] = useState<PromptResult[]>([]);
    const [wordsStreamed, setWordsStreamed] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isPanicState, setIsPanicState] = useState(false);
    const [manualFlowActive, setManualFlowActive] = useState(false);

    const beatPlayer = useRef(new BeatPlayer());
    const promptEngine = useRef(new PromptEngine());
    const arenaAudio = useRef(ArenaAudio.getInstance());
    const startTime = useRef<number>(0);
    const timerRef = useRef<number | null>(null);
    const wordIntervalRef = useRef<number | null>(null);
    const lastMultiplierMilestone = useRef<number>(1);
    const manualFlowTimer = useRef<number | null>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (wordIntervalRef.current) clearInterval(wordIntervalRef.current);
            if (manualFlowTimer.current) clearTimeout(manualFlowTimer.current);
            beatPlayer.current.stop();
        };
    }, []);

    // Spacebar to keep manual flow or restart on gameover
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" && e.target === document.body) {
                e.preventDefault();
                if (gameOver) {
                    startGame();
                } else if (isPlaying) {
                    triggerManualFlowPulse();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameOver, isPlaying]);

    const triggerManualFlowPulse = () => {
        setManualFlowActive(true);
        setIsPanicState(false);
        if (manualFlowTimer.current) clearTimeout(manualFlowTimer.current);
        manualFlowTimer.current = window.setTimeout(() => {
            setManualFlowActive(false);
        }, 400);
    };

    const fetchNextWord = () => {
        setUpcomingPrompts((prev) => {
            let queue = [...prev];
            // Ensure we have at least 3 items in queue
            while (queue.length < 3) {
                queue.push(promptEngine.current.getWordWithRhymes());
            }

            const next = queue.shift()!;
            setCurrentPrompt(next);
            setWordsStreamed((w) => w + 1);

            // Refill queue
            queue.push(promptEngine.current.getWordWithRhymes());
            return queue;
        });
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        arenaAudio.current.setMuted(next);
    };

    const startGame = async () => {
        setGameOver(false);
        setTimeSurvived(0);
        setWordsStreamed(0);
        setMultiplier(1);
        setIsPanicState(false);
        lastMultiplierMilestone.current = 1;

        // Pre-fill prompt radar
        const initialQueue = [
            promptEngine.current.getWordWithRhymes(),
            promptEngine.current.getWordWithRhymes(),
            promptEngine.current.getWordWithRhymes()
        ];
        const first = initialQueue.shift()!;
        setCurrentPrompt(first);
        setUpcomingPrompts(initialQueue);
        setWordsStreamed(1);

        try {
            await AudioContextManager.getInstance().initialize();
            await beatPlayer.current.loadBeat(currentBeat);
            await beatPlayer.current.start();

            arenaAudio.current.playRoundBell();
            setIsPlaying(true);
            startTime.current = Date.now();

            // Run high precision timer
            timerRef.current = window.setInterval(() => {
                const elapsed = (Date.now() - startTime.current) / 1000;
                setTimeSurvived(elapsed);

                // Multiplier milestones
                if (elapsed >= 35 && lastMultiplierMilestone.current < 5) {
                    lastMultiplierMilestone.current = 5;
                    setMultiplier(5);
                    arenaAudio.current.playAirhorn();
                    arenaAudio.current.playCrowdCheer("wild");
                } else if (elapsed >= 20 && lastMultiplierMilestone.current < 3) {
                    lastMultiplierMilestone.current = 3;
                    setMultiplier(3);
                    arenaAudio.current.playAirhorn();
                } else if (elapsed >= 10 && lastMultiplierMilestone.current < 2) {
                    lastMultiplierMilestone.current = 2;
                    setMultiplier(2);
                    arenaAudio.current.playSuccessChime();
                }
            }, 50);

            // Rotate prompt every 3.5 seconds
            wordIntervalRef.current = window.setInterval(() => {
                fetchNextWord();
            }, 3500);

        } catch (err) {
            console.error("Failed to start NoPause drill:", err);
            setIsPlaying(false);
        }
    };

    const handleSilence = (isSilent: boolean) => {
        if (!isPlaying) return;

        // If user is tapping manual flow, ignore microphone silence
        if (manualFlowActive) return;

        if (isSilent) {
            setIsPanicState(true);
            failGame();
        } else {
            setIsPanicState(false);
        }
    };

    const failGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        setIsPanicState(false);
        beatPlayer.current.stop();

        arenaAudio.current.playRecordScratch();
        window.setTimeout(() => {
            arenaAudio.current.playFailureBuzzer();
        }, 150);

        if (timerRef.current) clearInterval(timerRef.current);
        if (wordIntervalRef.current) clearInterval(wordIntervalRef.current);

        const finalTime = (Date.now() - startTime.current) / 1000;
        setTimeSurvived(finalTime);

        if (finalTime > highScore) {
            setHighScore(finalTime);
            localStorage.setItem("flowstate_nopause_best", finalTime.toFixed(1));
            arenaAudio.current.playCrowdCheer("wild");
        }
    };

    const getRank = (secs: number) => {
        if (secs < 12) return { title: "Rookie Breather", color: "text-zinc-400", badge: "BRONZE" };
        if (secs < 25) return { title: "Street Spitter", color: "text-cyan-400", badge: "SILVER" };
        if (secs < 45) return { title: "Cadence Machine", color: "text-purple-400", badge: "GOLD" };
        if (secs < 70) return { title: "Lyrical Marathoner", color: "text-amber-400", badge: "DIAMOND" };
        return { title: "UNTOUCHABLE GOD OF FLOW", color: "text-red-500", badge: "CYPHER GOD" };
    };

    const currentRank = getRank(timeSurvived);

    return (
        <PageTransition>
            <div className={`flex flex-col min-h-screen pt-20 pb-12 px-4 items-center justify-center relative transition-colors duration-300 ${
                isPanicState ? "bg-red-950/30" : "bg-transparent"
            }`}>
                {/* Header Navigation */}
                <div className="absolute top-20 left-6 z-20 flex items-center gap-3">
                    <Link to="/">
                        <NeonButton variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Hub
                        </NeonButton>
                    </Link>
                </div>

                {/* Sound & Personal Best Header */}
                <div className="absolute top-20 right-6 z-20 flex items-center gap-2">
                    <VolumeControl variant="pill" align="right" />

                    <div className="hidden sm:flex items-center gap-2 bg-black/60 border border-amber-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-zinc-400 font-mono">Best:</span>
                        <span className="text-xs font-black font-mono text-white">{highScore.toFixed(1)}s</span>
                    </div>
                </div>

                {/* Main Glass Deck */}
                <GlassCard className={`w-full max-w-3xl p-6 md:p-10 text-center transition-all duration-300 relative overflow-hidden backdrop-blur-2xl ${
                    gameOver
                        ? "border-red-500/60 bg-black/90 shadow-[0_0_60px_rgba(239,68,68,0.25)]"
                        : isPlaying
                            ? isPanicState
                                ? "border-red-500 bg-red-950/40 shadow-[0_0_70px_rgba(239,68,68,0.5)] scale-[1.01]"
                                : "border-cyan-500/40 bg-black/80 shadow-[0_0_60px_rgba(6,182,212,0.18)]"
                            : "border-white/10 bg-black/60 shadow-2xl"
                }`}>

                    {/* Pre-Game Setup */}
                    {!isPlaying && !gameOver && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 grid place-items-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                                <Zap className="w-8 h-8" />
                            </div>

                            <div>
                                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-400 uppercase px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30">
                                    ANTI-CHOKE DRILL
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mt-3">
                                    No-Pause Survival
                                </h1>
                                <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                                    Eliminate stuttering and train seamless freestyle endurance.
                                    <br />
                                    <span className="text-red-400 font-bold">Silence &gt; {(silenceTolerance / 1000).toFixed(1)}s = INSTANT GAME OVER.</span>
                                </p>
                            </div>

                            {/* Silence Tolerance Options */}
                            <div className="space-y-2">
                                <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block">
                                    Silence Tolerance Limit
                                </span>
                                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                                    {[
                                        { label: "Endurance", time: "1.4s", val: 1400, desc: "Building stamina" },
                                        { label: "Standard", time: "0.9s", val: 900, desc: "Classic battle test" },
                                        { label: "Sudden Death", time: "0.6s", val: 600, desc: "Zero hesitation" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() => setSilenceTolerance(opt.val)}
                                            className={`p-3 rounded-2xl border text-center transition-all ${
                                                silenceTolerance === opt.val
                                                    ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25"
                                                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            <div className="text-xs font-black">{opt.label}</div>
                                            <div className="text-[10px] font-mono opacity-80">{opt.time}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Beat Pill */}
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs font-mono max-w-md mx-auto">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Track: <strong className="text-white">{currentBeat.name}</strong></span>
                                </div>
                                <button
                                    onClick={() => triggerSettings("beats")}
                                    className="text-cyan-400 hover:underline font-bold"
                                >
                                    {currentBeat.bpm} BPM ↗
                                </button>
                            </div>

                            <div>
                                <NeonButton size="xl" onClick={startGame} className="w-full max-w-md mx-auto mt-2" variant="primary">
                                    <Flame className="w-5 h-5 mr-2" /> INITIATE FLOW DRILL
                                </NeonButton>
                            </div>
                        </div>
                    )}

                    {/* Playing State */}
                    {isPlaying && (
                        <div className="space-y-6">
                            {/* Top HUD Row: Time & Multiplier */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="text-left">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                                        Time Elapsed
                                    </span>
                                    <div className="text-5xl md:text-6xl font-mono font-black text-white tracking-tight">
                                        {timeSurvived.toFixed(1)}<span className="text-lg text-zinc-500 ml-1">s</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                                        Flow Multiplier
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm border ${
                                        multiplier >= 5
                                            ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                                            : multiplier >= 3
                                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                : multiplier >= 2
                                                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                                    : "bg-white/5 border-white/10 text-zinc-400"
                                    }`}>
                                        <Flame className="w-4 h-4" />
                                        <span>{multiplier}X FLOW</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Prompt Word Card */}
                            <AnimatePresence mode="wait">
                                {currentPrompt && (
                                    <motion.div
                                        key={currentPrompt.word}
                                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.05, y: -12 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white/5 border border-cyan-500/30 p-6 md:p-8 rounded-3xl space-y-3 relative overflow-hidden shadow-inner"
                                    >
                                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                                            <span className="uppercase tracking-widest bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                                                {currentPrompt.category}
                                            </span>
                                            <span>Word #{wordsStreamed}</span>
                                        </div>

                                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-wider uppercase select-none drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                            {currentPrompt.word}
                                        </h2>

                                        {currentPrompt.rhymes.length > 0 && (
                                            <div className="flex flex-wrap justify-center items-center gap-1.5 pt-2">
                                                <span className="text-xs font-mono text-zinc-500 mr-1">Rhymes:</span>
                                                {currentPrompt.rhymes.map((r) => (
                                                    <span
                                                        key={r}
                                                        className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-xl text-zinc-200 border border-white/5 shadow-sm"
                                                    >
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Upcoming Word Radar Strip */}
                            {upcomingPrompts.length > 0 && (
                                <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block text-center">
                                        Upcoming Word Radar (Think Ahead)
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {upcomingPrompts.map((p, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                                            >
                                                <span className="text-zinc-500">#{wordsStreamed + idx + 1}</span>
                                                <span className="font-bold text-white uppercase">{p.word}</span>
                                                <span className="text-[10px] text-cyan-400/80">{p.rhymes[0] || ""}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Vocal Microphone Monitor + Visualizer */}
                            <div className="w-full pt-2">
                                <MicrophoneMonitor
                                    onSilence={handleSilence}
                                    silenceThreshold={silenceTolerance}
                                    renderVisualizer={(analyser) => (
                                        <div className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-2xl bg-black/50 border border-white/5">
                                            {[...Array(24)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 via-blue-400 to-amber-400"
                                                    animate={{
                                                        height: isPanicState
                                                            ? [4, 6, 4]
                                                            : [6, Math.min(36, 8 + (i % 6) * 5), 6]
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        repeat: Infinity,
                                                        repeatType: "reverse",
                                                        delay: i * 0.03
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Panic Warning or Manual Tap Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                <button
                                    onClick={triggerManualFlowPulse}
                                    className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                                        manualFlowActive
                                            ? "bg-green-500 text-black border-green-400 shadow-md shadow-green-500/40"
                                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    <Keyboard className="w-3.5 h-3.5" />
                                    <span>Hold/Tap [Space] to Tap-Flow</span>
                                </button>

                                <NeonButton variant="danger" size="sm" onClick={failGame}>
                                    <ShieldAlert className="w-4 h-4 mr-1.5" /> Stop Drill
                                </NeonButton>
                            </div>
                        </div>
                    )}

                    {/* Game Over / Results Screen */}
                    {gameOver && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 grid place-items-center mx-auto text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                <AlertOctagon className="w-8 h-8" />
                            </div>

                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-red-500 uppercase tracking-tight">
                                    FLOW INTERRUPTED
                                </h1>
                                <p className="text-zinc-400 text-sm mt-1">
                                    Silence exceeded the {(silenceTolerance / 1000).toFixed(1)}s limit!
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                <div className="text-center">
                                    <span className="text-xs font-semibold uppercase text-zinc-300 tracking-wider">Survival Duration</span>
                                    <div className="text-6xl font-black font-mono text-white mt-1">
                                        {timeSurvived.toFixed(1)}<span className="text-2xl text-zinc-400 ml-1">s</span>
                                    </div>
                                    <div className={`text-sm font-bold uppercase tracking-wider ${currentRank.color} mt-2 flex items-center justify-center gap-1.5`}>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Rank: {currentRank.title}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">WORDS SPIT</span>
                                        <span className="text-2xl font-mono font-black text-cyan-400">{wordsStreamed}</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">PEAK MULTIPLIER</span>
                                        <span className="text-2xl font-mono font-black text-amber-400">{multiplier}X</span>
                                    </div>
                                </div>

                                {timeSurvived >= highScore && timeSurvived > 0 && (
                                    <div className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5">
                                        <Trophy className="w-4 h-4" /> NEW PERSONAL BEST RECORD!
                                    </div>
                                )}
                            </div>

                            <NeonButton size="xl" onClick={startGame} className="w-full mt-2" variant="primary">
                                <RefreshCw className="w-5 h-5 mr-2" /> TRY AGAIN [SPACE]
                            </NeonButton>
                        </div>
                    )}
                </GlassCard>
            </div>
        </PageTransition>
    );
}
