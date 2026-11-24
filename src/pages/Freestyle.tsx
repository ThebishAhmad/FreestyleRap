import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageTransition } from "@/components/layout/page-transition";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { Visualizer } from "@/components/features/Visualizer";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { RecordingModule } from "@/components/features/RecordingModule";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { ArenaAudio } from "@/lib/audio/ArenaAudio";
import { PromptEngine, PromptResult } from "@/lib/game/PromptEngine";
import { useBeat } from "@/contexts/BeatContext";
import { SpeechEngine } from "@/lib/audio/SpeechEngine";
import { RhythmGrid } from "@/components/features/RhythmGrid";
import { triggerSettings } from "@/components/features/SettingsPanel";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Play,
    Square,
    Music,
    Activity,
    Sparkles,
    Trophy,
    Zap,
    SkipForward,
    Volume2,
    VolumeX,
    Flame,
    Radio,
    Disc,
    CheckCircle2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";
import { VolumeControl } from "@/components/features/VolumeControl";

const CYPHER_TOPICS = [
    { id: "all", label: "Open Cypher", desc: "All freestyle themes" },
    { id: "Street", label: "Street & City", desc: "Underground blocks & hustle" },
    { id: "Cyber", label: "Cyberpunk", desc: "Silicon, matrix & glitch" },
    { id: "Battle", label: "Battle Mic", desc: "Punchlines & supremacy" },
    { id: "Hustle", label: "Hustle & Gold", desc: "Ambition & wealth" }
];

export default function Freestyle() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [promptData, setPromptData] = useState<PromptResult | null>(null);
    const [lastSpoken, setLastSpoken] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [speedSeconds, setSpeedSeconds] = useState<number>(4);
    const [difficulty, setDifficulty] = useState<"all" | "beginner" | "intermediate" | "master">("all");
    const [activeTopic, setActiveTopic] = useState<string>("all");
    const [showRhymes, setShowRhymes] = useState(true);
    const [wordsHitCount, setWordsHitCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [barCounter, setBarCounter] = useState(1);

    const beatPlayer = useRef(new BeatPlayer());
    const promptEngine = useRef(new PromptEngine());
    const speechEngine = useRef(new SpeechEngine());
    const arenaAudio = useRef(ArenaAudio.getInstance());
    const promptTimerRef = useRef<number | null>(null);
    const barIntervalRef = useRef<number | null>(null);

    const getNextPrompt = () => {
        const next = promptEngine.current.getWordWithRhymes(
            difficulty,
            activeTopic === "all" ? undefined : activeTopic
        );
        setPromptData(next);
    };

    // Auto-refresh prompt based on speedSeconds
    useEffect(() => {
        if (!isPlaying) return;

        getNextPrompt();

        promptTimerRef.current = window.setInterval(() => {
            getNextPrompt();
        }, speedSeconds * 1000);

        // Approximate bar cycle counter (1 bar = 240 / bpm)
        const barMs = (240 / (currentBeat.bpm || 90)) * 1000;
        barIntervalRef.current = window.setInterval(() => {
            setBarCounter((b) => (b % 8) + 1);
        }, barMs);

        // Continuous session score increment
        const scoreInterval = setInterval(() => {
            setScore((s) => s + 15);
        }, 1000);

        return () => {
            if (promptTimerRef.current) clearInterval(promptTimerRef.current);
            if (barIntervalRef.current) clearInterval(barIntervalRef.current);
            clearInterval(scoreInterval);
        };
    }, [isPlaying, speedSeconds, difficulty, activeTopic, currentBeat.bpm]);

    // Hotswap Beat Effect
    useEffect(() => {
        if (isPlaying) {
            beatPlayer.current.loadBeat(currentBeat).then(() => {
                beatPlayer.current.start();
            });
        }
    }, [currentBeat]);

    const handleSpeechResult = (text: string, isFinal: boolean) => {
        setLastSpoken(text);
        if (isFinal && promptData) {
            const lowerText = text.toLowerCase();
            const currentWord = promptData.word.toLowerCase();
            const hitRhyme = promptData.rhymes.find((r) => lowerText.includes(r.toLowerCase()));

            if (lowerText.includes(currentWord)) {
                setFeedback(`🎯 TARGET HIT: "${promptData.word}" (+600)`);
                setScore((s) => s + 600);
                setWordsHitCount((c) => c + 1);
                arenaAudio.current.playSuccessChime();
                setTimeout(() => setFeedback(null), 1400);
            } else if (hitRhyme) {
                setFeedback(`⚡ RHYME HIT: "${hitRhyme}" (+450)`);
                setScore((s) => s + 450);
                setWordsHitCount((c) => c + 1);
                arenaAudio.current.playSuccessChime();
                setTimeout(() => setFeedback(null), 1400);
            }
        }
    };

    const handleSilence = (isSilent: boolean) => {
        if (isSilent && isPlaying) {
            setFeedback("DON'T FREEZE! -30");
            setScore((s) => Math.max(0, s - 30));
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleFiller = (word: string) => {
        setFeedback(`NO FILLER (${word.toUpperCase()}) -20`);
        setScore((s) => Math.max(0, s - 20));
        setTimeout(() => setFeedback(null), 1000);
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        arenaAudio.current.setMuted(next);
    };

    useEffect(() => {
        return () => {
            beatPlayer.current.stop();
            speechEngine.current.stop();
            if (promptTimerRef.current) clearInterval(promptTimerRef.current);
            if (barIntervalRef.current) clearInterval(barIntervalRef.current);
        };
    }, []);

    const toggleSession = async () => {
        if (!isPlaying) {
            try {
                setIsStarting(true);
                setFeedback("GET READY TO SPIT...");

                await AudioContextManager.getInstance().initialize();

                await beatPlayer.current.loadBeat(currentBeat);
                await beatPlayer.current.start();

                arenaAudio.current.playRoundBell();
                speechEngine.current.start(handleSpeechResult, handleFiller);

                setScore(0);
                setWordsHitCount(0);
                setBarCounter(1);
                setIsPlaying(true);
                setFeedback(null);
            } catch (err) {
                console.error("Failed to start session:", err);
            } finally {
                setIsStarting(false);
            }
        } else {
            try {
                beatPlayer.current.stop();
                speechEngine.current.stop();
            } catch (err) {
                console.error("Error stopping engines:", err);
            } finally {
                setIsPlaying(false);
                setFeedback(null);
            }
        }
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen pt-20 pb-12 px-4 md:px-8 gap-5 items-center justify-center relative overflow-hidden">
                {/* Sub-Header Bar */}
                <div className="w-full max-w-7xl flex items-center justify-between z-20">
                    <Link to="/">
                        <NeonButton variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Hub
                        </NeonButton>
                    </Link>

                    {/* Score & Sound & Beat Pill */}
                    <div className="flex items-center gap-3">
                        {/* Beat Volume Customization Widget */}
                        <VolumeControl variant="pill" align="right" />

                        <button
                            onClick={() => triggerSettings("beats")}
                            className="hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-full text-xs font-mono text-zinc-300 hover:border-cyan-400/40 transition-all"
                        >
                            <Music className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{currentBeat.name}</span>
                            <span className="text-cyan-400">({currentBeat.bpm} BPM)</span>
                        </button>

                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="font-mono text-sm md:text-base font-bold text-white">
                                {score.toLocaleString()} PTS
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Session Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full max-w-7xl relative z-10">

                    {/* Left Panel: Audio Control & Visuals */}
                    <GlassCard className="h-full p-6 flex flex-col justify-between border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl rounded-[2rem]">
                        <div className="flex flex-col gap-5">
                            {/* Status Header & 8-Bar Progression Ring */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-cyan-400" />
                                        Cypher Monitor
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                                        <span className="text-xs font-mono text-zinc-500">
                                            {isPlaying ? "LIVE VOCALS ARMED" : "STANDBY"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* 8-Bar Counter */}
                                    {isPlaying && (
                                        <div className="flex items-center gap-1 bg-black/60 border border-white/10 px-3 py-1 rounded-full text-xs font-mono">
                                            <Disc className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                                            <span>BAR {barCounter}/8</span>
                                        </div>
                                    )}
                                    <RecordingModule isRecording={isPlaying} autoArm={true} />
                                </div>
                            </div>

                            {/* Main Visualizer Area */}
                            <div className="h-56 relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner flex flex-col justify-between">
                                <MicrophoneMonitor
                                    renderVisualizer={(analyser) => <Visualizer analyser={analyser} className="w-full h-full opacity-80" />}
                                    onSilence={handleSilence}
                                    silenceThreshold={1400}
                                />

                                {/* Speech Text Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                                    <p className="text-center font-mono text-sm md:text-base text-white/90 drop-shadow min-h-[1.5em] truncate">
                                        {lastSpoken || <span className="text-zinc-600">Waiting for microphone input...</span>}
                                    </p>
                                </div>

                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10">
                                        <div className="px-4 py-2 rounded-full border border-white/10 bg-black/80 text-xs text-zinc-500 font-mono tracking-widest uppercase">
                                            Visualizer Offline
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Live DJ Soundboard Panel */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
                                    Live DJ Soundboard (Drop Over Beat)
                                </span>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {[
                                        { label: "AIRHORN", icon: "📣", action: () => arenaAudio.current.playAirhorn() },
                                        { label: "SCRATCH", icon: "🎧", action: () => arenaAudio.current.playRecordScratch() },
                                        { label: "CROWD", icon: "🗣️", action: () => arenaAudio.current.playCrowdCheer("hype") },
                                        { label: "CLAP", icon: "👏", action: () => arenaAudio.current.playReverbClap() },
                                        { label: "BELL", icon: "🔔", action: () => arenaAudio.current.playRoundBell() }
                                    ].map((pad) => (
                                        <button
                                            key={pad.label}
                                            type="button"
                                            onClick={pad.action}
                                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-center transition-all active:scale-95 flex flex-col items-center gap-1"
                                        >
                                            <span className="text-base">{pad.icon}</span>
                                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase truncate">
                                                {pad.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="pt-4">
                            <NeonButton
                                size="xl"
                                variant={isPlaying ? "danger" : "primary"}
                                onClick={toggleSession}
                                disabled={isStarting}
                                className="w-full shadow-lg"
                            >
                                {isStarting ? (
                                    <><Sparkles className="mr-2 h-5 w-5 animate-spin" /> SYNCHRONIZING...</>
                                ) : isPlaying ? (
                                    <><Square className="mr-2 h-5 w-5 fill-current" /> STOP FREESTYLE</>
                                ) : (
                                    <><Play className="mr-2 h-5 w-5 fill-current" /> START FREESTYLE</>
                                )}
                            </NeonButton>
                        </div>
                    </GlassCard>

                    {/* Right Panel: Neurolinguistic Word Engine */}
                    <GlassCard className="h-full flex flex-col justify-between border-white/10 bg-gradient-to-br from-zinc-950 to-black shadow-2xl p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
                        {/* Settings Toolbar */}
                        <div className="flex flex-col gap-3 pb-4 border-b border-white/10 z-10">
                            {/* Topic Row */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1 shrink-0">Topic:</span>
                                {CYPHER_TOPICS.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => setActiveTopic(topic.id)}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                                            activeTopic === topic.id
                                                ? "bg-cyan-500 text-black shadow-md"
                                                : "bg-white/5 text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        {topic.label}
                                    </button>
                                ))}
                            </div>

                            {/* Speed & Difficulty Row */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Speed:</span>
                                    {[
                                        { label: "1 Bar", val: 2 },
                                        { label: "2 Bars", val: 4 },
                                        { label: "4 Bars", val: 8 }
                                    ].map((spd) => (
                                        <button
                                            key={spd.val}
                                            onClick={() => setSpeedSeconds(spd.val)}
                                            className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                                                speedSeconds === spd.val
                                                    ? "bg-purple-500 text-white shadow-md"
                                                    : "bg-white/5 text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            {spd.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1">
                                    {(["all", "beginner", "intermediate", "master"] as const).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all ${
                                                difficulty === d
                                                    ? "bg-amber-500 text-black shadow-md"
                                                    : "bg-white/5 text-zinc-500 hover:text-white"
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Central Word Prompt Radar Area */}
                        <div className="flex-1 flex flex-col items-center justify-center py-6 z-10 text-center">
                            <AnimatePresence mode="wait">
                                {promptData ? (
                                    <motion.div
                                        key={promptData.word}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 1.05 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-4 w-full"
                                    >
                                        {/* Category & Syllables */}
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
                                                {promptData.category}
                                            </span>
                                            <span className="text-[11px] font-mono uppercase text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                                {promptData.syllables} {promptData.syllables === 1 ? "Syllable" : "Syllables"}
                                            </span>
                                        </div>

                                        {/* Main Prompt Word */}
                                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 tracking-tight select-none">
                                            {promptData.word}
                                        </h2>

                                        {/* Rhyme Constellation Satellites */}
                                        {showRhymes && promptData.rhymes.length > 0 && (
                                            <div className="pt-2">
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                                                    Rhyme Satellites (Say to Connect):
                                                </span>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {promptData.rhymes.map((rhyme) => (
                                                        <span
                                                            key={rhyme}
                                                            className="px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                                                        >
                                                            {rhyme}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        <Sparkles className="w-10 h-10 text-cyan-400/40 mx-auto animate-pulse" />
                                        <h3 className="text-3xl font-black text-white/50">PRESS START TO CYPHER</h3>
                                        <p className="text-xs text-zinc-500 font-mono">Real-time vocabulary and rhyme assists will stream here</p>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* System Feedback Alert */}
                            <div className="h-10 flex items-center justify-center mt-3">
                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${
                                                feedback.includes("HIT")
                                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                    : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                            }`}
                                        >
                                            {feedback}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Bottom Actions: Next Word & Toggle Rhymes */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10 z-10">
                            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                                <button
                                    onClick={() => setShowRhymes(!showRhymes)}
                                    className="hover:text-white transition-colors"
                                >
                                    {showRhymes ? "Hide Assists" : "Show Assists"}
                                </button>
                                <span>•</span>
                                <span>Hits: <strong className="text-white">{wordsHitCount}</strong></span>
                            </div>

                            <button
                                onClick={getNextPrompt}
                                disabled={!isPlaying}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all disabled:opacity-40"
                            >
                                <SkipForward className="w-3.5 h-3.5 text-cyan-400" /> Next Prompt
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageTransition>
    );
}
