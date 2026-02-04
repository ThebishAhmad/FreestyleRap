"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, Play, Square, SkipForward, ArrowLeft } from "lucide-react";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { BEATS } from "@/data/beats";
import { PromptEngine, Prompt } from "@/lib/game/PromptEngine";
import { ConstraintEngine } from "@/lib/game/ConstraintEngine";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { Visualizer } from "@/components/features/Visualizer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";

export default function FreestyleTrainerPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [transcript, setTranscript] = useState("");

    const beatPlayerRef = useRef<BeatPlayer | null>(null);
    const constraintEngineRef = useRef<ConstraintEngine | null>(null);

    useEffect(() => {
        beatPlayerRef.current = new BeatPlayer();
        constraintEngineRef.current = new ConstraintEngine((text) => {
            setTranscript(prev => (prev + " " + text).slice(-100));
        });
        AudioContextManager.getInstance().initialize().catch(console.error);
        return () => {
            beatPlayerRef.current?.stop();
            constraintEngineRef.current?.stop();
        };
    }, []);

    const startSession = async () => {
        setIsPlaying(true);
        setPrompt(PromptEngine.getPrompt('topic'));
        if (beatPlayerRef.current) {
            await beatPlayerRef.current.loadBeat(BEATS[0]);
            beatPlayerRef.current.start();
        }
        constraintEngineRef.current?.start();
    };

    const stopSession = () => {
        setIsPlaying(false);
        beatPlayerRef.current?.stop();
        constraintEngineRef.current?.stop();
    };

    const nextPrompt = () => {
        setPrompt(PromptEngine.getPrompt('topic'));
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center relative overflow-hidden p-6">

                <header className="w-full max-w-6xl mb-12 z-10 flex justify-between items-center">
                    <Link href="/" className="text-muted-foreground hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Home
                    </Link>
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Freestyle Mode</span>
                </header>

                <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center space-y-12 z-10">

                    <div className="min-h-[250px] flex items-center justify-center w-full">
                        <AnimatePresence mode="wait">
                            {isPlaying && prompt ? (
                                <motion.div
                                    key={prompt.text}
                                    initial={{ scale: 0.9, opacity: 0, filter: "blur(20px)" }}
                                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                                    className="text-center"
                                >
                                    <div className="text-sm uppercase tracking-[0.5em] text-primary mb-6 animate-pulse">{prompt.type}</div>
                                    <h1 className="text-6xl md:text-9xl font-black uppercase text-white drop-shadow-2xl leading-none tracking-tighter">
                                        {prompt.text}
                                    </h1>
                                </motion.div>
                            ) : (
                                !isPlaying && (
                                    <div className="text-center opacity-60">
                                        <h1 className="text-4xl font-bold mb-4">THE BOOTH IS OPEN</h1>
                                        <p className="max-w-md mx-auto">Get ready for random topics. Don't think. Just flow.</p>
                                    </div>
                                )
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-6">
                        {!isPlaying ? (
                            <NeonButton size="xl" onClick={startSession}>
                                <Mic className="w-8 h-8" /> DROP THE BEAT
                            </NeonButton>
                        ) : (
                            <>
                                <NeonButton variant="danger" size="lg" onClick={stopSession}>
                                    <Square className="w-6 h-6 fill-current" /> STOP
                                </NeonButton>
                                <NeonButton variant="secondary" size="lg" onClick={nextPrompt}>
                                    <SkipForward className="w-6 h-6 fill-current" /> SKIP
                                </NeonButton>
                            </>
                        )}
                    </div>

                    {isPlaying && (
                        <GlassCard className="mt-8 p-4 text-center max-w-2xl text-muted-foreground font-mono text-xs opacity-60">
                            {transcript || "Listening..."}
                        </GlassCard>
                    )}

                </main>

                <div className="fixed bottom-8 w-full max-w-2xl z-20">
                    <GlassCard className="p-4 bg-black/60 border-white/10">
                        <MicrophoneMonitor
                            renderVisualizer={(analyser) => <Visualizer analyser={analyser} className="w-full h-24 rounded" />}
                        />
                    </GlassCard>
                </div>
            </div>
        </PageTransition>
    );
}
