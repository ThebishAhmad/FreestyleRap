"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Play, Square, RefreshCw, ArrowLeft } from "lucide-react";
import { RhymeEngine, Rhyme } from "@/lib/rhymeEngine";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { BEATS } from "@/data/beats";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { Visualizer } from "@/components/features/Visualizer";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";

export default function RhymeTrainerPage() {
    const [targetWord, setTargetWord] = useState<string>("");
    const [rhymes, setRhymes] = useState<Rhyme[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const beatPlayerRef = useRef<BeatPlayer | null>(null);

    useEffect(() => {
        beatPlayerRef.current = new BeatPlayer();
        AudioContextManager.getInstance().initialize().catch(console.error);
        return () => beatPlayerRef.current?.stop();
    }, []);

    const startGame = async () => {
        setIsPlaying(true);
        const words = ["flow", "time", "light", "dream", "tech", "soul", "mind"];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        await nextRound(randomWord);

        if (beatPlayerRef.current) {
            await beatPlayerRef.current.loadBeat(BEATS[0]);
            beatPlayerRef.current.start();
        }
    };

    const stopGame = () => {
        setIsPlaying(false);
        beatPlayerRef.current?.stop();
        setTargetWord("");
    };

    const nextRound = async (word: string) => {
        setTargetWord(word);
        const results = await RhymeEngine.getRhymes(word);
        setRhymes(results.slice(0, 12));
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col p-4 relative overflow-hidden">

                <header className="flex justify-between items-center mb-8 z-10 w-full max-w-6xl mx-auto">
                    <Link href="/" className="group flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                    <div className="text-sm font-bold uppercase tracking-widest text-primary glow-text">Rhyme Trainer</div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-4xl mx-auto space-y-12">

                    <div className="relative w-full text-center">
                        <AnimatePresence mode="wait">
                            {targetWord ? (
                                <motion.div
                                    key={targetWord}
                                    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                >
                                    <div className="text-sm uppercase tracking-[0.5em] text-muted-foreground mb-4">Target Rhyme</div>
                                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase neon-text mb-8">{targetWord}</h1>
                                </motion.div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                                        READY TO SPIT?
                                    </h2>
                                    <NeonButton onClick={startGame} size="xl" className="mx-auto">
                                        <Play className="fill-current w-6 h-6" /> START SESSION
                                    </NeonButton>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {isPlaying && (
                        <GlassCard className="p-6 w-full">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {rhymes.map((rhyme, i) => (
                                    <motion.div
                                        key={rhyme.word}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                        className="text-center p-3 rounded-lg bg-white/5 border border-white/5 text-lg font-mono text-blue-200/80 hover:bg-white/10 transition-colors"
                                    >
                                        {rhyme.word}
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {isPlaying && (
                        <div className="flex gap-4">
                            <NeonButton onClick={stopGame} variant="danger" size="lg">
                                <Square className="fill-current w-5 h-5" /> STOP
                            </NeonButton>
                            <NeonButton onClick={() => nextRound("change")} variant="secondary" size="lg">
                                <RefreshCw className="w-5 h-5" /> NEW WORD
                            </NeonButton>
                        </div>
                    )}

                </main>

                {/* Audio Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl z-20">
                    <GlassCard className="p-4 backdrop-blur-md bg-black/40 border-white/5">
                        <MicrophoneMonitor
                            renderVisualizer={(analyser) => <Visualizer analyser={analyser} className="w-full h-16 rounded opacity-80" />}
                        />
                    </GlassCard>
                </div>
            </div>
        </PageTransition>
    );
}
