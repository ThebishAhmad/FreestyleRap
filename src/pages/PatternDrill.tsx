import { useState, useRef, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { NeonButton } from "@/components/ui/neon-button";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { SpeechEngine } from "@/lib/audio/SpeechEngine";
import { ArenaAudio } from "@/lib/audio/ArenaAudio";
import { PatternEngine, PATTERNS } from "@/lib/game/PatternEngine";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Grid,
    RefreshCw,
    Mic,
    Clock,
    Square,
    Trophy,
    Sparkles,
    CheckCircle2,
    Music,
    Volume2,
    VolumeX,
    Flame,
    Radio
} from "lucide-react";
import { RhythmGrid } from "@/components/features/RhythmGrid";
import { useBeatState } from "@/hooks/useBeatTiming";
import { useBeat } from "@/contexts/BeatContext";
import { useWordPack } from "@/contexts/WordPackContext";
import { RecordingModule } from "@/components/features/RecordingModule";
import { SessionProgress } from "@/components/features/SessionProgress";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import PillNav from "@/components/ui/PillNav";
import { VolumeControl } from "@/components/features/VolumeControl";

type GameMode = "easy" | "punchline" | "cliff" | "hidden";
type SessionLength = 8 | 16 | 32 | 64 | "Infinity";

export default function PatternDrill() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [patternId, setPatternId] = useState<string>("AABB");
    const [gameMode, setGameMode] = useState<GameMode>("easy");
    const [sessionLength, setSessionLength] = useState<SessionLength>(16);
    const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const [lockedRhymesCount, setLockedRhymesCount] = useState(0);
    const [recentLockedWord, setRecentLockedWord] = useState<string | null>(null);

    // Viewport Scroll State
    const [startBarIndex, setStartBarIndex] = useState(0);

    // Audio & Game refs
    const beatPlayer = useRef(new BeatPlayer());
    const patternEngine = useRef(new PatternEngine());
    const speechEngine = useRef(new SpeechEngine());
    const arenaAudio = useRef(ArenaAudio.getInstance());
    const lastBeatIdRef = useRef<string | null>(currentBeat?.id || null);
    const lockedTimeoutRef = useRef<number | null>(null);

    // Source of Truth for Timing
    const timing = useBeatState(currentBeat, isPlaying);

    // Auto-Scroll Logic: Active Bar is always the first row
    useEffect(() => {
        if (!isPlaying) {
            setStartBarIndex(0);
            return;
        }
        setStartBarIndex(timing.currentBar);
    }, [timing.currentBar, isPlaying]);

    // Check Session End
    useEffect(() => {
        if (isPlaying && sessionLength !== "Infinity" && timing.currentBar >= sessionLength) {
            completeSession();
        }
    }, [timing.currentBar, isPlaying, sessionLength]);

    // Hotswap beat when not playing
    useEffect(() => {
        if (lastBeatIdRef.current === null && currentBeat?.id) {
            lastBeatIdRef.current = currentBeat.id;
        }
        if (!isPlaying && !countdown && currentBeat.id !== lastBeatIdRef.current) {
            lastBeatIdRef.current = currentBeat.id;
            beatPlayer.current.loadBeat(currentBeat).catch(console.error);
        }
    }, [currentBeat, isPlaying, countdown]);

    // Countdown Logic
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            arenaAudio.current.playTick(countdown === 1);
            const timer = setTimeout(() => {
                setCountdown((prev) => (prev !== null ? prev - 1 : null));
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            startAudio();
            setCountdown(null);
        }
    }, [countdown]);

    // Update Word Pack
    const { activeWordPack } = useWordPack();
    useEffect(() => {
        patternEngine.current.setPack(activeWordPack);
    }, [activeWordPack]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            beatPlayer.current.stop();
            speechEngine.current.stop();
            if (lockedTimeoutRef.current) clearTimeout(lockedTimeoutRef.current);
        };
    }, []);

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        arenaAudio.current.setMuted(next);
    };

    const startGame = async () => {
        setSessionCompleted(false);
        setLockedRhymesCount(0);
        setRecentLockedWord(null);
        patternEngine.current.reset();
        patternEngine.current.setPattern(patternId);

        if (currentBeat) lastBeatIdRef.current = currentBeat.id;

        try {
            await AudioContextManager.getInstance().initialize();
            await beatPlayer.current.loadBeat(currentBeat);

            setIsPlaying(true);
            setCountdown(3);
        } catch (error) {
            console.error("Failed to start pattern drill:", error);
            setIsPlaying(false);
        }
    };

    const startAudio = async () => {
        try {
            await beatPlayer.current.start();
            arenaAudio.current.playRoundBell();

            // Start SpeechEngine to detect spoken target rhymes
            speechEngine.current.start((text: string) => {
                checkSpokenRhyme(text);
            });
        } catch (e) {
            console.error("Failed to start audio", e);
            stopGame("error");
        }
    };

    // Check if the user spoke the expected rhyme word for the current active bar
    const checkSpokenRhyme = (transcript: string) => {
        if (!transcript.trim()) return;
        const currentContent = patternEngine.current.getContentForBar(timing.currentBar);
        const targetWord = currentContent.suggestion.toLowerCase();

        const words = transcript.toLowerCase().split(/\s+/);
        if (words.some((w) => w.includes(targetWord) || targetWord.includes(w))) {
            // Rhyme Locked!
            setLockedRhymesCount((prev) => prev + 1);
            setRecentLockedWord(currentContent.suggestion);
            arenaAudio.current.playSuccessChime();

            if (lockedTimeoutRef.current) clearTimeout(lockedTimeoutRef.current);
            lockedTimeoutRef.current = window.setTimeout(() => {
                setRecentLockedWord(null);
            }, 1800);
        }
    };

    const completeSession = () => {
        beatPlayer.current.stop();
        speechEngine.current.stop();
        setIsPlaying(false);
        setSessionCompleted(true);
        arenaAudio.current.playCrowdCheer("hype");
        arenaAudio.current.playAirhorn();
    };

    const stopGame = (source = "user") => {
        beatPlayer.current.stop();
        speechEngine.current.stop();
        setIsPlaying(false);
        setCountdown(null);
    };

    /**
     * Determines visibility based on Game Mode and slot index
     */
    const getVisibility = (slotIndex: number, slots: string[]): boolean => {
        if (gameMode === "easy") return true;
        if (gameMode === "hidden") return false;

        const group = slots[slotIndex];
        const groupIndices = slots.map((s, i) => (s === group ? i : -1)).filter((i) => i !== -1);
        const positionInGroup = groupIndices.indexOf(slotIndex);

        if (gameMode === "punchline") {
            // Show only the last one in the group
            return positionInGroup === groupIndices.length - 1;
        }

        if (gameMode === "cliff") {
            // Show only the first one in the group
            return positionInGroup === 0;
        }

        return true;
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen bg-transparent text-white relative overflow-hidden font-sans">
                {/* Header Navigation */}
                <header className="pt-20 px-6 flex items-center justify-between w-full max-w-7xl mx-auto z-20">
                    <Link to="/">
                        <NeonButton variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Hub
                        </NeonButton>
                    </Link>

                    <div className="flex items-center gap-3">
                        <VolumeControl variant="pill" align="right" />

                        {isRecordingEnabled && (
                            <RecordingModule isRecording={isPlaying && !countdown} autoArm={true} />
                        )}
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 z-10 w-full max-w-7xl mx-auto">
                    {/* Setup Screen */}
                    <AnimatePresence mode="wait">
                        {!isPlaying && !sessionCompleted ? (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col items-center justify-center max-w-2xl text-center z-20 w-full"
                            >
                                <div className="space-y-6 bg-black/90 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl w-full">
                                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 grid place-items-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                                        <Grid className="w-8 h-8" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30">
                                            RHYME SCHEME ENGINE
                                        </span>
                                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mt-3">
                                            Pattern Trainer
                                        </h1>
                                        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                                            Train complex cadences and lock your punchlines on beat 4.
                                        </p>
                                    </div>

                                    {/* Rhyme Scheme Selector Cards */}
                                    <div className="space-y-2 text-left">
                                        <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block text-center">
                                            Select Rhyme Scheme
                                        </span>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {Object.values(PATTERNS).map((pat) => {
                                                const isSel = patternId === pat.id;
                                                return (
                                                    <button
                                                        key={pat.id}
                                                        type="button"
                                                        onClick={() => setPatternId(pat.id)}
                                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                                            isSel
                                                                ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]"
                                                                : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black block font-mono uppercase">{pat.name}</div>
                                                        <div className="text-[10px] font-mono text-cyan-400 font-bold mt-1">
                                                            {pat.slots.join("-")}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Game Mode Pill Selector */}
                                    <div className="space-y-2">
                                        <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block">
                                            Drill Mode
                                        </span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(["easy", "punchline", "cliff", "hidden"] as GameMode[]).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setGameMode(mode)}
                                                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                                                        gameMode === mode
                                                            ? "bg-white text-black shadow-md"
                                                            : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
                                                    }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Length & Record Options */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1.5">
                                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> SESSION LENGTH
                                            </span>
                                            <div className="flex gap-1">
                                                {(["16", "32", "inf"] as const).map((l) => (
                                                    <button
                                                        key={l}
                                                        onClick={() =>
                                                            setSessionLength(l === "inf" ? "Infinity" : (parseInt(l) as SessionLength))
                                                        }
                                                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                                                            (sessionLength === "Infinity" && l === "inf") ||
                                                            sessionLength === parseInt(l)
                                                                ? "bg-cyan-500 text-black"
                                                                : "bg-white/5 text-zinc-400"
                                                        }`}
                                                    >
                                                        {l === "inf" ? "∞" : `${l}B`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1.5">
                                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                                <Mic className="w-3 h-3" /> AUDIO RECORDING
                                            </span>
                                            <button
                                                onClick={() => setIsRecordingEnabled(!isRecordingEnabled)}
                                                className={`px-4 py-1 rounded-lg text-xs font-mono font-bold ${
                                                    isRecordingEnabled ? "bg-red-500 text-white" : "bg-white/5 text-zinc-400"
                                                }`}
                                            >
                                                {isRecordingEnabled ? "ENABLED" : "OFF"}
                                            </button>
                                        </div>
                                    </div>

                                    <NeonButton size="xl" onClick={startGame} className="w-full mt-2" variant="primary">
                                        <Flame className="w-5 h-5 mr-2" /> START PATTERN SESSION
                                    </NeonButton>
                                </div>
                            </motion.div>
                        ) : isPlaying ? (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 25 }}
                                className="w-full flex flex-col items-center justify-center relative z-20"
                            >
                                {/* Top Beat & Metronome Pulser Bar */}
                                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 max-w-6xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black/75 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
                                            <Grid className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs font-mono font-bold text-white">
                                                {PATTERNS[patternId].name} ({PATTERNS[patternId].slots.join("-")})
                                            </span>
                                        </div>

                                        <SessionProgress
                                            isPlaying={isPlaying}
                                            sessionLength={sessionLength}
                                            currentBar={timing.currentBar}
                                            beat={currentBeat}
                                        />
                                    </div>

                                    {/* 4-Beat Real-Time Metronome Pulser */}
                                    <div className="flex items-center gap-2 bg-black/75 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Beat:</span>
                                        {[0, 1, 2, 3].map((b) => {
                                            const isCurrent = timing.beatIndex === b;
                                            return (
                                                <div
                                                    key={b}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs transition-all ${
                                                        isCurrent
                                                            ? b === 3
                                                                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-110"
                                                                : "bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110"
                                                            : "bg-white/5 text-zinc-500"
                                                    }`}
                                                >
                                                    {b + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Floating Rhyme Locked Toast */}
                                <AnimatePresence>
                                    {recentLockedWord && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -15, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="mb-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-white font-mono font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>RHYME LOCKED: "{recentLockedWord}" (+300 PTS)</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Main Rhythm Grid Screen */}
                                <div className="w-full max-w-6xl aspect-[16/9] max-h-[62vh] glass-surface rounded-[2rem] p-3 shadow-2xl overflow-hidden relative">
                                    <RhythmGrid
                                        rows={4}
                                        barsPerRow={4}
                                        startBarIndex={Math.max(0, startBarIndex * 4)}
                                        activeBarIndex={timing.currentBar * 4 + timing.beatIndex}
                                        renderBarContent={(globalStepIndex, isActive) => {
                                            const globalBarIndex = Math.floor(globalStepIndex / 4);
                                            const beatInBar = globalStepIndex % 4;
                                            const isLastBeat = beatInBar === 3;

                                            if (isLastBeat) {
                                                const rowTarget = patternEngine.current.getContentForBar(globalBarIndex);
                                                const patternLength = PATTERNS[patternId].slots.length;
                                                const slotIndex = globalBarIndex % patternLength;
                                                const isVisible = getVisibility(slotIndex, PATTERNS[patternId].slots);

                                                return (
                                                    <div className="flex flex-col items-center justify-center h-full w-full gap-1 relative overflow-hidden">
                                                        <div
                                                            className={`
                                                                relative px-3 py-2 rounded-2xl border transition-all duration-300 w-full text-center flex items-center justify-center shadow-lg
                                                                ${
                                                                    isActive
                                                                        ? "bg-cyan-500 text-black border-cyan-400 scale-105 shadow-[0_0_30px_rgba(6,182,212,0.6)] z-10 font-black"
                                                                        : "bg-white/5 text-white/80 border-white/5"
                                                                }
                                                                ${!isVisible ? "opacity-30 blur-[2px] grayscale border-transparent bg-transparent" : "opacity-100"}
                                                            `}
                                                        >
                                                            <span className="text-lg md:text-2xl font-black uppercase tracking-tight truncate">
                                                                {isVisible ? rowTarget.suggestion : "???"}
                                                            </span>
                                                        </div>

                                                        {isActive && (
                                                            <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                                                                {rowTarget.vowel.split("-")[0]} Sound
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    className={`flex flex-col items-center justify-center h-full w-full transition-all ${
                                                        isActive ? "scale-110 opacity-100" : "opacity-15"
                                                    }`}
                                                >
                                                    <span className="font-black text-3xl md:text-4xl text-white">
                                                        {beatInBar + 1}
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>

                                {/* Countdown Overlay */}
                                <AnimatePresence>
                                    {countdown !== null && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none"
                                        >
                                            <motion.div
                                                key={countdown}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1.4, opacity: 1 }}
                                                exit={{ scale: 2, opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="font-black text-[12rem] text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 drop-shadow-[0_0_60px_rgba(6,182,212,0.9)]"
                                            >
                                                {countdown}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bottom Stop CTA */}
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={() => stopGame("manual")}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all text-xs font-mono font-bold uppercase"
                                    >
                                        <Square className="w-3.5 h-3.5 fill-current" />
                                        <span>End Session</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* Session Completed Screen */
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center my-auto w-full"
                            >
                                <div className="bg-black/90 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl w-full space-y-6">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        <Trophy className="w-8 h-8" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-emerald-400 uppercase px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30">
                                            PATTERN COMPLETE
                                        </span>
                                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mt-3">
                                            SESSION CONCLUDED
                                        </h2>
                                        <p className="text-zinc-300 text-sm mt-1">
                                            Pattern: {PATTERNS[patternId].name} • {sessionLength} Bars
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">BARS SPIT</span>
                                            <span className="text-2xl font-mono font-black text-white mt-1 block">{timing.currentBar}</span>
                                        </div>
                                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">RHYMES LOCKED</span>
                                            <span className="text-2xl font-mono font-black text-cyan-400 mt-1 block">{lockedRhymesCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <NeonButton size="xl" onClick={startGame} variant="primary" className="flex-1">
                                            <RefreshCw className="mr-2 h-4 w-4" /> DRILL AGAIN
                                        </NeonButton>
                                        <NeonButton
                                            size="xl"
                                            onClick={() => setSessionCompleted(false)}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            CHANGE SCHEME
                                        </NeonButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </PageTransition>
    );
}
