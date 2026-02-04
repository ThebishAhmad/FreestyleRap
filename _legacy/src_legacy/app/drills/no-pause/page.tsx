"use client";

import { useState, useEffect, useRef } from "react";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { BEATS } from "@/data/beats";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { Visualizer } from "@/components/features/Visualizer";
import { Link } from "lucide-react";
import { motion } from "framer-motion";

export default function NoPauseDrillPage() {
    const [gameState, setGameState] = useState<'idle' | 'running' | 'failed'>('idle');
    const [score, setScore] = useState(0);
    const startTimeRef = useRef<number>(0);
    const beatPlayerRef = useRef<BeatPlayer | null>(null);

    useEffect(() => {
        beatPlayerRef.current = new BeatPlayer();
        AudioContextManager.getInstance().initialize().catch(() => { });
        return () => beatPlayerRef.current?.stop();
    }, []);

    const startGame = async () => {
        setGameState('running');
        setScore(0);
        startTimeRef.current = Date.now();
        await beatPlayerRef.current?.loadBeat(BEATS[1]); // Faster beat
        beatPlayerRef.current?.start();
    };

    const handleSilence = (isSilent: boolean) => {
        if (gameState === 'running' && isSilent) {
            // In No-Pause drill, silence is FATAL immediately (or after very short buffer)
            // For UX, we give maybe 800ms buffer, but component might report silence instantly.
            // We'll trust the user to keep measuring.
            // For this demo, let's just fail them.
            failGame();
        }
    };

    const failGame = () => {
        setGameState('failed');
        beatPlayerRef.current?.stop();
    };

    // Score timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'running') {
            interval = setInterval(() => {
                setScore(prev => prev + 1);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${gameState === 'failed' ? 'bg-destructive/20' : 'bg-background'}`}>

            {gameState === 'idle' && (
                <div className="text-center space-y-8">
                    <h1 className="text-6xl font-black neon-text uppercase">No Pause Drill</h1>
                    <p className="text-xl text-muted-foreground">If you stop for 0.8s, you die.</p>
                    <button onClick={startGame} className="bg-primary text-primary-foreground px-12 py-6 rounded-full text-2xl font-bold hover:scale-105 transition-transform">
                        START DRILL
                    </button>
                </div>
            )}

            {gameState === 'running' && (
                <div className="text-center space-y-4">
                    <div className="text-9xl font-black min-w-[200px] text-center font-mono">
                        {(score / 10).toFixed(1)}s
                    </div>
                    <div className="text-accent animate-pulse uppercase tracking-widest">KEEP SPITTING</div>
                </div>
            )}

            {gameState === 'failed' && (
                <div className="text-center space-y-8">
                    <h1 className="text-8xl font-black text-destructive uppercase">FAILED</h1>
                    <p className="text-2xl">You froze at {(score / 10).toFixed(1)}s</p>
                    <button onClick={startGame} className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform">
                        RETRY
                    </button>
                    <a href="/drills" className="block text-muted-foreground hover:underline mt-4">Back to Drills</a>
                </div>
            )}

            <div className="fixed bottom-0 w-full h-24 opacity-50 pointer-events-none">
                <MicrophoneMonitor onSilence={handleSilence} renderVisualizer={analyser => <Visualizer analyser={analyser} className="w-full h-full" />} />
            </div>
        </div>
    );
}
