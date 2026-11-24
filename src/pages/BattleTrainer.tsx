import { useState, useRef, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { NeonButton } from "@/components/ui/neon-button";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { SpeechEngine } from "@/lib/audio/SpeechEngine";
import { ArenaAudio } from "@/lib/audio/ArenaAudio";
import { PromptEngine } from "@/lib/game/PromptEngine";
import { BattleScorer, PunchlineHit } from "@/lib/game/BattleScorer";
import { useBeat } from "@/contexts/BeatContext";
import { Link } from "react-router-dom";
import {
    Sword,
    Trophy,
    Flame,
    Users,
    Zap,
    Volume2,
    VolumeX,
    RotateCcw,
    Sparkles,
    ShieldAlert,
    Radio,
    Clock,
    Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BATTLE_OPPONENTS, OpponentPersona } from "@/data/battleOpponents";

import { BattleStage } from "@/components/battle/BattleStage";
import { OpponentAvatar } from "@/components/battle/OpponentAvatar";
import { PlayerHUD } from "@/components/battle/PlayerHUD";
import { EnergyBar } from "@/components/battle/EnergyBar";
import { CinematicLyrics } from "@/components/battle/CinematicLyrics";
import { VersusHeader } from "@/components/battle/VersusHeader";

type Turn = "intro" | "ai" | "user" | "intermission";
type BattlePace = "8s" | "10s" | "12s";

interface RoundResult {
    roundNumber: number;
    scoreGained: number;
    punchlines: number;
    endHype: number;
}

interface PaceConfig {
    seconds: number;
    barCount: number;
    label: string;
    sublabel: string;
    desc: string;
    speedMultiplier: number;
    safetyCutoffSeconds: number;
}

const BATTLE_PACES: Record<BattlePace, PaceConfig> = {
    "8s": {
        seconds: 8,
        barCount: 2,
        label: "8s Blitz",
        sublabel: "2 Bars",
        desc: "2-bar couplet • Finishes in ~5.2s (before 8s)",
        speedMultiplier: 1.25,
        safetyCutoffSeconds: 6.5
    },
    "10s": {
        seconds: 10,
        barCount: 3,
        label: "10s Pro",
        sublabel: "3 Bars",
        desc: "3-bar cadence • Finishes in ~7.2s (before 10s)",
        speedMultiplier: 1.18,
        safetyCutoffSeconds: 8.4
    },
    "12s": {
        seconds: 12,
        barCount: 4,
        label: "12s Heavy",
        sublabel: "4 Bars",
        desc: "4-bar full verse • Finishes in ~9.0s (before 12s)",
        speedMultiplier: 1.12,
        safetyCutoffSeconds: 10.2
    }
};

export default function BattleTrainer() {
    const { currentBeat } = useBeat();
    const [selectedOpponent, setSelectedOpponent] = useState<OpponentPersona>(BATTLE_OPPONENTS[0]);
    const [pace, setPace] = useState<BattlePace>("10s");
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [turn, setTurn] = useState<Turn>("intro");
    const [currentRoast, setCurrentRoast] = useState("");
    const [targetWord, setTargetWord] = useState("CROWN");
    const [counterSuggestions, setCounterSuggestions] = useState<string[]>([]);
    const [userTranscript, setUserTranscript] = useState("");
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const maxRounds = 3;
    const [timeLeft, setTimeLeft] = useState(10);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [crowdHype, setCrowdHype] = useState(50); // 0 to 100
    const [punchlinesCount, setPunchlinesCount] = useState(0);
    const [recentHit, setRecentHit] = useState<PunchlineHit | null>(null);
    const [isStageFlashing, setIsStageFlashing] = useState(false);
    const [isOpponentStunned, setIsOpponentStunned] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isMicAvailable, setIsMicAvailable] = useState(true);
    const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
    const [roundStartScore, setRoundStartScore] = useState(0);
    const [roundStartPunchlines, setRoundStartPunchlines] = useState(0);

    const beatPlayer = useRef(new BeatPlayer());
    const promptEngine = useRef(new PromptEngine());
    const speechEngine = useRef(new SpeechEngine());
    const battleScorer = useRef(new BattleScorer());
    const arenaAudio = useRef(ArenaAudio.getInstance());
    const roundTimer = useRef<number | null>(null);
    const countdownInterval = useRef<number | null>(null);
    const aiSpeechSafetyTimeout = useRef<number | null>(null);
    const hitBannerTimeout = useRef<number | null>(null);
    const flashTimeout = useRef<number | null>(null);
    const stunTimeout = useRef<number | null>(null);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

    const currentPaceConfig = BATTLE_PACES[pace];
    const turnDuration = currentPaceConfig.seconds;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopGame();
        };
    }, []);

    // Countdown interval during turns
    useEffect(() => {
        if (isPlaying && (turn === "ai" || turn === "user")) {
            setTimeLeft(turnDuration);
            countdownInterval.current = window.setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => {
                if (countdownInterval.current) clearInterval(countdownInterval.current);
            };
        }
    }, [turn, isPlaying, turnDuration]);

    // Handle Mute Toggle
    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        arenaAudio.current.setMuted(nextMuted);
    };

    /**
     * Builds exactly the requested number of bars based on active turn pace:
     * - 8s  -> Exactly 2 bars (punches early, finishes by ~5.2s)
     * - 10s -> Exactly 3 bars (finishes by ~7.2s)
     * - 12s -> Exactly 4 bars (finishes by ~9.0s)
     */
    const generateRoastForPace = (opponent: OpponentPersona, targetPace: BattlePace): string => {
        const pool = opponent.roasts;
        const r1 = pool[Math.floor(Math.random() * pool.length)];
        let r2 = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1) {
            while (r1 === r2) {
                r2 = pool[Math.floor(Math.random() * pool.length)];
            }
        }

        const r1Lines = r1.split(/\s*\/\s*/).map((l) => l.trim()).filter(Boolean);
        const r2Lines = r2.split(/\s*\/\s*/).map((l) => l.trim()).filter(Boolean);

        if (targetPace === "8s") {
            // Exactly 2 bars!
            const line1 = r1Lines[0];
            const line2 = r1Lines[1] || r1Lines[0];
            return `${line1} / ${line2}`;
        } else if (targetPace === "10s") {
            // Exactly 3 bars!
            const line1 = r1Lines[0];
            const line2 = r1Lines[1] || r1Lines[0];
            const line3 = r2Lines[1] || r2Lines[0] || "Step off the stage, your time is running out.";
            return `${line1} / ${line2} / ${line3}`;
        } else {
            // Exactly 4 bars!
            const line1 = r1Lines[0];
            const line2 = r1Lines[1] || r1Lines[0];
            const line3 = r2Lines[0];
            const line4 = r2Lines[1] || r2Lines[0];
            return `${line1} / ${line2} / ${line3} / ${line4}`;
        }
    };

    /**
     * Speech synthesis with guaranteed completion BEFORE turn timer runs out.
     */
    const speakRoast = (text: string, currentPace: BattlePace) => {
        if (!synth) return;
        if (synth.speaking) synth.cancel();

        const config = BATTLE_PACES[currentPace];
        const cleanText = text.replace(/\//g, ", ");
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Calibrate rate so it finishes well before turnDuration
        const baseRate = selectedOpponent.voiceRate || 1.0;
        utterance.rate = Math.max(1.05, Math.min(1.45, baseRate * config.speedMultiplier));
        utterance.pitch = selectedOpponent.voicePitch || 1.0;
        utterance.volume = 1.0;

        const voices = synth.getVoices();
        const preferred = voices.find((v) =>
            selectedOpponent.preferredVoiceNames.some((name) =>
                v.name.toLowerCase().includes(name.toLowerCase())
            )
        );
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
            setIsAISpeaking(false);
        };

        utterance.onerror = () => {
            setIsAISpeaking(false);
        };

        setIsAISpeaking(true);
        synth.speak(utterance);

        // HARD SAFETY CUTOFF: Force-cancel speech if it ever reaches safety threshold
        if (aiSpeechSafetyTimeout.current) clearTimeout(aiSpeechSafetyTimeout.current);
        aiSpeechSafetyTimeout.current = window.setTimeout(() => {
            if (synth && synth.speaking) {
                synth.cancel();
            }
            setIsAISpeaking(false);
        }, config.safetyCutoffSeconds * 1000);
    };

    // Process a hit result
    const registerHit = (hit: PunchlineHit) => {
        setRecentHit(hit);
        setScore((s) => s + hit.points);
        setCombo((c) => {
            const next = c + 1;
            setMaxCombo((m) => Math.max(m, next));
            return next;
        });
        setPunchlinesCount((p) => p + 1);
        setCrowdHype((h) => Math.min(100, h + hit.hypeBonus));

        // Visual flash & avatar stun
        setIsStageFlashing(true);
        if (flashTimeout.current) clearTimeout(flashTimeout.current);
        flashTimeout.current = window.setTimeout(() => setIsStageFlashing(false), 260);

        setIsOpponentStunned(true);
        if (stunTimeout.current) clearTimeout(stunTimeout.current);
        stunTimeout.current = window.setTimeout(() => setIsOpponentStunned(false), 650);

        // Sound cues
        arenaAudio.current.playPunchlineHit();
        arenaAudio.current.playCrowdCheer(hit.type === "counter" ? "wild" : "hype");

        if (hit.shouldAirhorn) {
            window.setTimeout(() => {
                arenaAudio.current.playAirhorn();
            }, 120);
        }

        // Hide hit banner after 2.8s
        if (hitBannerTimeout.current) clearTimeout(hitBannerTimeout.current);
        hitBannerTimeout.current = window.setTimeout(() => setRecentHit(null), 2800);
    };

    // Start entire match
    const startGame = async () => {
        stopGame();
        setGameOver(false);
        setScore(0);
        setRound(1);
        setCombo(0);
        setMaxCombo(0);
        setPunchlinesCount(0);
        setCrowdHype(50);
        setRoundResults([]);
        setRoundStartScore(0);
        setRoundStartPunchlines(0);
        setUserTranscript("");
        setRecentHit(null);
        setTurn("intro");
        setCurrentRoast("STEPPING INTO THE ARENA...");

        try {
            await AudioContextManager.getInstance().initialize();
            await beatPlayer.current.loadBeat(currentBeat);
            await beatPlayer.current.start();
            setIsPlaying(true);
        } catch (error) {
            console.error("Failed to start battle beat:", error);
            setIsPlaying(true);
        }

        arenaAudio.current.playRoundBell();

        // 2.5s Intro display before AI kicks off Round 1
        roundTimer.current = window.setTimeout(() => {
            startAITurn(1);
        }, 2500);
    };

    // AI Turn
    const startAITurn = (roundNum: number) => {
        setTurn("ai");
        setTimeLeft(turnDuration);
        setUserTranscript("");
        speechEngine.current.stop();

        // Generate tailored bars according to turn pace (2 bars for 8s, 3 bars for 10s, 4 bars for 12s)
        const roastBars = generateRoastForPace(selectedOpponent, pace);
        setCurrentRoast(roastBars);
        speakRoast(roastBars, pace);

        // Extract counter suggestions
        const counters = promptEngine.current.getCounterRhymes(roastBars);
        setTargetWord(counters.triggerWord);
        setCounterSuggestions(counters.suggestions);

        // AI delivery slightly chips at player hype
        setCrowdHype((h) => Math.max(15, h - 4));

        roundTimer.current = window.setTimeout(() => {
            startUserTurn(roundNum);
        }, turnDuration * 1000);
    };

    // User Turn
    const startUserTurn = (roundNum: number) => {
        // ABSOLUTE SAFETY: Cancel any lingering AI speech immediately when user's turn begins!
        if (aiSpeechSafetyTimeout.current) clearTimeout(aiSpeechSafetyTimeout.current);
        if (synth && synth.speaking) synth.cancel();
        setIsAISpeaking(false);

        setTurn("user");
        setTimeLeft(turnDuration);
        battleScorer.current.resetRound();
        setUserTranscript("");

        // Bell ding signaling player turn
        arenaAudio.current.playRoundBell();

        // Record round starting stats
        setRoundStartScore(score);
        setRoundStartPunchlines(punchlinesCount);

        // Start listening via Web Speech API
        try {
            speechEngine.current.start(
                (text: string) => {
                    setUserTranscript(text);
                    const hit = battleScorer.current.evaluateTranscript(
                        text,
                        targetWord,
                        counterSuggestions,
                        combo
                    );
                    if (hit) {
                        registerHit(hit);
                    }
                },
                (filler: string) => {
                    // Small crowd reaction if player uses filler words
                    setCrowdHype((h) => Math.max(10, h - 2));
                }
            );
            setIsMicAvailable(true);
        } catch {
            setIsMicAvailable(false);
        }

        roundTimer.current = window.setTimeout(() => {
            concludeTurn(roundNum);
        }, turnDuration * 1000);
    };

    // Conclude User Turn & check for next round or finish
    const concludeTurn = (currentRoundNum: number) => {
        speechEngine.current.stop();

        const gained = score - roundStartScore;
        const punchlinesGained = punchlinesCount - roundStartPunchlines;

        const roundSummary: RoundResult = {
            roundNumber: currentRoundNum,
            scoreGained: gained,
            punchlines: punchlinesGained,
            endHype: crowdHype
        };

        setRoundResults((prev) => [...prev, roundSummary]);

        if (currentRoundNum < maxRounds) {
            // Next round intermission
            setTurn("intermission");
            arenaAudio.current.playCrowdCheer("small");

            roundTimer.current = window.setTimeout(() => {
                const nextRound = currentRoundNum + 1;
                setRound(nextRound);
                startAITurn(nextRound);
            }, 3000);
        } else {
            // Battle finished!
            endBattle();
        }
    };

    // End Battle
    const endBattle = () => {
        stopGame();
        setGameOver(true);
        if (crowdHype >= 50) {
            arenaAudio.current.playCrowdCheer("wild");
            arenaAudio.current.playAirhorn();
        } else {
            arenaAudio.current.playCrowdBoo();
        }
    };

    // Manual bar submission (for keyboard mode or click suggestions)
    const handleManualBar = (text: string) => {
        setUserTranscript(text);
        const hit = battleScorer.current.evaluateTranscript(
            text,
            targetWord,
            counterSuggestions,
            combo
        );
        if (hit) {
            registerHit(hit);
        } else {
            // Base flow points if not an exact rhyme
            setScore((s) => s + 200);
            setCrowdHype((h) => Math.min(100, h + 3));
        }
    };

    const handleSuggestionClick = (word: string) => {
        handleManualBar(`I take the ${word} and blow your whole spot down!`);
    };

    const stopGame = () => {
        setIsPlaying(false);
        setIsAISpeaking(false);
        beatPlayer.current.stop();
        speechEngine.current.stop();
        if (synth && synth.speaking) synth.cancel();
        if (aiSpeechSafetyTimeout.current) clearTimeout(aiSpeechSafetyTimeout.current);
        if (roundTimer.current) clearTimeout(roundTimer.current);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        if (hitBannerTimeout.current) clearTimeout(hitBannerTimeout.current);
        if (flashTimeout.current) clearTimeout(flashTimeout.current);
        if (stunTimeout.current) clearTimeout(stunTimeout.current);
    };

    const surrender = () => {
        stopGame();
        setCrowdHype(10);
        setGameOver(true);
        arenaAudio.current.playCrowdBoo();
    };

    // Verdict computation
    const userWon = crowdHype >= 50;
    const isKnockout = crowdHype >= 75 || maxCombo >= 4;

    return (
        <PageTransition>
            <BattleStage isFlashing={isStageFlashing}>
                {/* Stage Header */}
                <VersusHeader
                    round={round}
                    maxRounds={maxRounds}
                    score={score}
                    combo={combo}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onSurrender={surrender}
                />

                {/* Main Battle Content Area */}
                <div className="flex-1 w-full flex flex-col justify-between py-2 px-4 relative z-10">

                    {/* Pre-Game Setup / Character Selection */}
                    <AnimatePresence mode="wait">
                        {!isPlaying && !gameOver && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                                className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center my-auto"
                            >
                                <div className="space-y-6 bg-black/90 p-6 md:p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl w-full">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 border border-white/20 grid place-items-center mx-auto text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                        <Sword className="w-7 h-7 text-red-500" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-red-500 uppercase px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30">
                                            3-ROUND ARENA BATTLE
                                        </span>
                                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 tracking-tight mt-3">
                                            AI RAP BATTLE
                                        </h1>
                                        <p className="text-zinc-400 text-xs md:text-sm mt-2 max-w-md mx-auto">
                                            Face an autonomous MC. Trade timed bars on beat, connect punchlines, and win the crowd.
                                        </p>
                                    </div>

                                    {/* Opponent Selection Cards */}
                                    <div className="space-y-2 text-left">
                                        <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block text-center">
                                            Select Your Opponent
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {BATTLE_OPPONENTS.map((opp) => {
                                                const isSelected = selectedOpponent.id === opp.id;
                                                return (
                                                    <button
                                                        key={opp.id}
                                                        type="button"
                                                        onClick={() => setSelectedOpponent(opp)}
                                                        className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                                                            isSelected
                                                                ? "bg-white/10 border-white text-white shadow-xl scale-[1.02]"
                                                                : "bg-black/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3">
                                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping block" />
                                                            </div>
                                                        )}
                                                        <div className={`font-black text-sm block ${opp.avatarColor}`}>
                                                            {opp.name}
                                                        </div>
                                                        <div className="text-xs text-zinc-300 mt-1 line-clamp-1">
                                                            {opp.style}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Pace / Turn Duration Selection: 8s (2 Bars), 10s (3 Bars), 12s (4 Bars) */}
                                    <div className="space-y-2 text-left">
                                        <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block text-center">
                                            Battle Turn Pace
                                        </span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["8s", "10s", "12s"] as BattlePace[]).map((p) => {
                                                const active = pace === p;
                                                const info = BATTLE_PACES[p];
                                                return (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPace(p)}
                                                        className={`py-2.5 px-3 rounded-2xl border text-center transition-all ${
                                                            active
                                                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                                                                : "bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200"
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black font-mono">{info.label}</div>
                                                        <div className="text-[10px] font-mono text-cyan-400 font-bold mt-0.5">
                                                            {info.sublabel}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[11px] font-mono text-zinc-500 text-center pt-1">
                                            {currentPaceConfig.desc}
                                        </p>
                                    </div>

                                    {/* Beat Preview Info */}
                                    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs font-mono">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Radio className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>BEAT: {currentBeat.name}</span>
                                        </div>
                                        <span className="text-zinc-500 font-bold">{currentBeat.bpm} BPM</span>
                                    </div>

                                    <NeonButton
                                        size="xl"
                                        onClick={startGame}
                                        className="w-full text-base font-black tracking-wider"
                                        variant="danger"
                                    >
                                        <Flame className="mr-2 h-5 w-5" /> STEP ON STAGE
                                    </NeonButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Battle Gameplay */}
                    {isPlaying && !gameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-between gap-2"
                        >
                            {/* Energy & Crowd Balance Bar */}
                            <div className="w-full max-w-3xl">
                                <EnergyBar
                                    aiEnergy={Math.max(5, 100 - crowdHype)}
                                    userEnergy={crowdHype}
                                    opponentName={selectedOpponent.name}
                                />
                            </div>

                            {/* Opponent Avatar & Status */}
                            <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 my-auto">
                                <OpponentAvatar
                                    opponent={selectedOpponent}
                                    isActive={turn === "ai" && isAISpeaking}
                                    isStunned={isOpponentStunned}
                                    speechStatus={
                                        turn === "ai"
                                            ? isAISpeaking
                                                ? "SPITTING BARS..."
                                                : "VERSE COMPLETE • YOUR MOVE"
                                            : turn === "user"
                                                ? "LISTENING TO YOU"
                                                : "READY"
                                    }
                                />

                                {/* Lyrics / Counter Display */}
                                <div className="w-full max-w-4xl min-h-[140px] flex items-center justify-center">
                                    {turn === "intro" ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center space-y-2"
                                        >
                                            <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">
                                                ROUND {round} OF {maxRounds} ({currentPaceConfig.label})
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                                                {selectedOpponent.name} <span className="text-zinc-600">VS</span> YOU
                                            </h2>
                                            <p className="text-zinc-400 text-sm font-mono">
                                                Listen close... Prepare your counter punchlines!
                                            </p>
                                        </motion.div>
                                    ) : turn === "ai" ? (
                                        <div className="w-full flex flex-col items-center">
                                            <CinematicLyrics
                                                text={currentRoast}
                                                isActive={true}
                                                speakerName={selectedOpponent.name}
                                                accentColor={selectedOpponent.avatarColor}
                                            />
                                            {!isAISpeaking && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse"
                                                >
                                                    VERSE FINISHED • GET READY TO DROP!
                                                </motion.div>
                                            )}
                                        </div>
                                    ) : turn === "intermission" ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center space-y-2"
                                        >
                                            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                                                ROUND {round} COMPLETE
                                            </span>
                                            <h3 className="text-2xl md:text-4xl font-black text-white">
                                                GET READY FOR ROUND {round + 1}
                                            </h3>
                                            <p className="text-zinc-400 text-xs font-mono">
                                                The arena is heating up! Keep your flow tight.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="w-full text-center">
                                            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-cyan-300 animate-pulse mb-3">
                                                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                                                YOUR TURN: DROP YOUR COUNTER BARS!
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Player HUD Deck */}
                            <PlayerHUD
                                isActive={turn === "user"}
                                timeLeft={timeLeft}
                                maxTime={turnDuration}
                                score={score}
                                combo={combo}
                                transcript={userTranscript}
                                targetWord={targetWord}
                                counterSuggestions={counterSuggestions}
                                recentHit={recentHit}
                                isMicAvailable={isMicAvailable}
                                onManualSubmitBar={handleManualBar}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        </motion.div>
                    )}

                    {/* Battle Over / Victory Decision Card */}
                    {gameOver && (
                        <motion.div
                            key="gameover"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center my-auto p-4 z-50 w-full"
                        >
                            <div className="bg-black/90 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl w-full space-y-6">
                                <div className={`w-20 h-20 rounded-3xl grid place-items-center mx-auto border ${
                                    userWon
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                                        : "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                                }`}>
                                    <Trophy className="w-10 h-10" />
                                </div>

                                <div>
                                    <span className={`text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full border ${
                                        userWon
                                            ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
                                            : "bg-red-950/40 border-red-500/30 text-red-400"
                                    }`}>
                                        {userWon
                                            ? isKnockout
                                                ? "🏆 UNANIMOUS DECISION - KNOCKOUT"
                                                : "🥇 SPLIT DECISION - VICTORY"
                                            : "💀 DEFEAT - OPPONENT RETAINS BELT"}
                                    </span>

                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mt-3">
                                        {userWon ? "YOU WON THE BATTLE" : "BATTLE FINISHED"}
                                    </h2>
                                    <p className="text-zinc-400 text-sm mt-1">
                                        3 Rounds ({currentPaceConfig.label}) against <span className="text-white font-bold">{selectedOpponent.name}</span>
                                    </p>
                                </div>

                                {/* Score Card Metrics */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">Total Score</span>
                                        <span className="text-xl font-mono font-black text-white mt-1 block">{score.toLocaleString()}</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">Crowd Hype</span>
                                        <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">{Math.round(crowdHype)}%</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">Punchlines</span>
                                        <span className="text-xl font-mono font-black text-amber-400 mt-1 block">{punchlinesCount}</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block">Max Combo</span>
                                        <span className="text-xl font-mono font-black text-red-400 mt-1 block">{maxCombo}X</span>
                                    </div>
                                </div>

                                {/* Round by Round Summary */}
                                {roundResults.length > 0 && (
                                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-left">
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block text-center">
                                            Judge Round Breakdown
                                        </span>
                                        {roundResults.map((r) => (
                                            <div
                                                key={r.roundNumber}
                                                className="flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 text-zinc-300"
                                            >
                                                <span>ROUND {r.roundNumber}</span>
                                                <span className="text-amber-400">+{r.scoreGained} PTS</span>
                                                <span className="text-cyan-400">{r.punchlines} HITS</span>
                                                <span className="text-zinc-500">Hype: {Math.round(r.endHype)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <NeonButton size="xl" onClick={startGame} variant="primary" className="flex-1">
                                        <RotateCcw className="mr-2 h-4 w-4" /> REMATCH
                                    </NeonButton>
                                    <NeonButton
                                        size="xl"
                                        onClick={() => {
                                            stopGame();
                                            setGameOver(false);
                                            setIsPlaying(false);
                                        }}
                                        variant="secondary"
                                        className="flex-1"
                                    >
                                        CHANGE OPPONENT
                                    </NeonButton>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </BattleStage>
        </PageTransition>
    );
}
