import { NeonButton } from "@/components/ui/neon-button";
import { PageTransition } from "@/components/layout/page-transition";
import { Mic, Zap, Trophy, Crown, Sparkles, Grid, Sword, Timer, Play, Pause, Music, Volume2, ShieldCheck, Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingModal } from "@/components/features/OnboardingModal";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeControl } from "@/components/features/VolumeControl";
import TextPressure from "@/components/ui/TextPressure";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { useBeat } from "@/contexts/BeatContext";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";

export default function Home() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { currentBeat, allBeats, setCurrentBeat } = useBeat();
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const previewPlayer = useRef(new BeatPlayer());

    const togglePreview = async () => {
        if (isPreviewPlaying) {
            previewPlayer.current.stop();
            setIsPreviewPlaying(false);
        } else {
            try {
                await AudioContextManager.getInstance().initialize();
                await previewPlayer.current.loadBeat(currentBeat);
                await previewPlayer.current.start();
                setIsPreviewPlaying(true);
            } catch (e) {
                console.warn("Could not play beat preview:", e);
            }
        }
    };

    useEffect(() => {
        return () => {
            previewPlayer.current.stop();
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25, scale: 0.96 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 120, damping: 20 }
        }
    };

    return (
        <PageTransition>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-start min-h-screen p-4 pt-28 pb-20 gap-14 text-center bg-transparent relative z-10 perspective-1000 max-w-7xl mx-auto"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 relative z-20">
                    {/* Logo/Title */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-purple-600/10 blur-[90px] opacity-60" />
                        <h1 className="text-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 relative z-10 select-none tracking-tight">
                            FLOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-purple-400">STATE</span>
                        </h1>
                        <motion.div
                            className="absolute -top-6 -right-6 text-amber-400 hidden md:block"
                            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Crown className="w-10 h-10 opacity-80 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                        </motion.div>
                    </div>

                    {/* Tagline */}
                    <div className="flex flex-col items-center gap-2 max-w-xl">
                        <p className="text-lg md:text-2xl text-zinc-300 font-light">
                            Master the Art of <span className="text-white font-bold">Freestyle Rap</span> & <span className="text-cyan-400 font-bold">Rhyme Mechanics</span>
                        </p>
                    </div>

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                        <NeonButton
                            size="xl"
                            onClick={() => setShowOnboarding(true)}
                        >
                            <Mic className="w-5 h-5 mr-3" />
                            ENTER THE BOOTH
                        </NeonButton>

                        <Link to="/battle">
                            <NeonButton
                                size="xl"
                                variant="secondary"
                            >
                                <Sword className="w-5 h-5 mr-3 text-red-400" />
                                BATTLE ARENA
                            </NeonButton>
                        </Link>
                    </div>

                    {/* Interactive Beat Preview Pill & Dedicated Volume Customization */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-3 bg-black/60 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-xl"
                        >
                            <button
                                onClick={togglePreview}
                                className={`p-2 rounded-full transition-all ${isPreviewPlaying
                                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                                    : "bg-white/10 text-cyan-400 hover:bg-white/20"
                                    }`}
                                title={isPreviewPlaying ? "Pause Beat" : "Play Beat Preview"}
                            >
                                {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                            </button>

                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                                    {currentBeat.name}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {currentBeat.style.toUpperCase()} • {currentBeat.bpm} BPM
                                </span>
                            </div>

                            {isPreviewPlaying && (
                                <div className="flex items-end gap-1 h-5 ml-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-cyan-400 rounded-full"
                                            animate={{ height: ["20%", "90%", "30%"] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        <VolumeControl variant="pill" align="center" />
                    </div>
                </motion.div>

                {/* 4 Feature Modes Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-2"
                >
                    {/* FREESTYLE GYM */}
                    <Link to="/freestyle" className="block group">
                        <div className="h-full bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/10 hover:border-cyan-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between text-left shadow-xl relative overflow-hidden group-hover:shadow-[0_12px_32px_rgba(6,182,212,0.18)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                            <div className="space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all mb-4">
                                    <Mic className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                                    Freestyle Gym
                                </h3>
                                <p className="text-sm text-zinc-300 font-normal leading-relaxed">
                                    Continuous instrumentals with real-time prompt generation, rhyme assistance, and multi-syllabic flow support.
                                </p>
                            </div>
                            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                    Rhyme Assists
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-cyan-300 transition-colors">
                                    Launch
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* PATTERN TRAINER */}
                    <Link to="/drill/pattern" className="block group">
                        <div className="h-full bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/10 hover:border-purple-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between text-left shadow-xl relative overflow-hidden group-hover:shadow-[0_12px_32px_rgba(168,85,247,0.18)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
                            <div className="space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:bg-purple-500/20 transition-all mb-4">
                                    <Grid className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                                    Pattern Trainer
                                </h3>
                                <p className="text-sm text-zinc-300 font-normal leading-relaxed">
                                    Master AABB couplets, alternate ABAB schemes, and punchline timing locked on the 4-beat rhythm grid.
                                </p>
                            </div>
                            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                    AABB Schemes
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-purple-300 transition-colors">
                                    Launch
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* BATTLE ARENA */}
                    <Link to="/battle" className="block group">
                        <div className="h-full bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/10 hover:border-red-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between text-left shadow-xl relative overflow-hidden group-hover:shadow-[0_12px_32px_rgba(239,68,68,0.18)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-all" />
                            <div className="space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 group-hover:bg-red-500/20 transition-all mb-4">
                                    <Sword className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-red-400 transition-colors">
                                    Battle Arena
                                </h3>
                                <p className="text-sm text-zinc-300 font-normal leading-relaxed">
                                    Face off against AI battle rappers with timed rounds, speech synthesis roasts, and real crowd reactions.
                                </p>
                            </div>
                            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20">
                                    3 AI Opponents
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-red-300 transition-colors">
                                    Launch
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* NO-PAUSE SURVIVAL */}
                    <Link to="/drill/no-pause" className="block group">
                        <div className="h-full bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/10 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between text-left shadow-xl relative overflow-hidden group-hover:shadow-[0_12px_32px_rgba(245,158,11,0.18)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                            <div className="space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all mb-4">
                                    <Timer className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                                    No-Pause Drill
                                </h3>
                                <p className="text-sm text-zinc-300 font-normal leading-relaxed">
                                    Flow continuously without stopping. Pausing for more than 0.9s ends the run. Train stamina and kill filler words.
                                </p>
                            </div>
                            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    High Score Mode
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-amber-300 transition-colors">
                                    Launch
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
            </motion.div>
        </PageTransition>
    );
}
