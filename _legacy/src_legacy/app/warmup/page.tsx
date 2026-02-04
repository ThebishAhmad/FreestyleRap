"use client";

import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { Metronome } from "@/components/features/Metronome";
import { NeonButton } from "@/components/ui/neon-button";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { BEATS } from "@/data/beats";
import { Play, Mic, Coffee } from "lucide-react";

export default function WarmupPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [word, setWord] = useState("Breathe");

    const beatPlayerRef = useRef<BeatPlayer | null>(null);

    useEffect(() => {
        beatPlayerRef.current = new BeatPlayer();
        return () => beatPlayerRef.current?.stop();
    }, []);

    const toggleSession = async () => {
        if (isPlaying) {
            setIsPlaying(false);
            beatPlayerRef.current?.stop();
            setWord("Relax");
        } else {
            setIsPlaying(true);
            // Slower beat for warmup
            const warmupBeat = { ...BEATS[0], bpm: 85 };
            await beatPlayerRef.current?.loadBeat(warmupBeat);
            beatPlayerRef.current?.start();
            wordLoop();
        }
    };

    const wordLoop = () => {
        const EASY_WORDS = ["Yeah", "Flow", "Go", "Listen", "Right", "Time", "Mind", "Free"];
        let i = 0;
        const interval = setInterval(() => {
            if (!beatPlayerRef.current) { clearInterval(interval); return; }
            setWord(EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)]);
        }, 4000); // Change slowly
    };

    return (
        <PageTransition>
            <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 space-y-12">

                <header className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-secondary mb-2">
                        <Coffee className="w-6 h-6" />
                        <span className="uppercase tracking-widest font-bold">Daily Warmup</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold">Find Your Pocket</h1>
                    <p className="text-muted-foreground">No scoring. No failure. Jusk keep talking.</p>
                </header>

                <GlassCard className="p-12 w-full max-w-xl flex flex-col items-center justify-center gap-8 min-h-[300px]">
                    {isPlaying ? (
                        <>
                            <div className="text-6xl font-black uppercase tracking-wider neon-text animate-pulse">
                                {word}
                            </div>
                            <Metronome bpm={85} isPlaying={true} className="mt-8 scale-150" />
                        </>
                    ) : (
                        <div className="text-center space-y-4 opacity-50">
                            <Mic className="w-16 h-16 mx-auto mb-4" />
                            <p>Press start to begin the rhythm.</p>
                        </div>
                    )}
                </GlassCard>

                <NeonButton
                    onClick={toggleSession}
                    variant={isPlaying ? "danger" : "secondary"}
                    size="lg"
                >
                    {isPlaying ? "End Warmup" : "Start Session"} <Play className="w-4 h-4 ml-2 fill-current" />
                </NeonButton>

            </div>
        </PageTransition>
    );
}
