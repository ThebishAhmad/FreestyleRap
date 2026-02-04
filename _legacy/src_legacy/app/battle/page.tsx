"use client";

import { useState, useRef, useEffect } from "react";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { BEATS } from "@/data/beats";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { motion } from "framer-motion";

const TAUNTS = [
    "Weak flow!",
    "Is that all you got?",
    "My grandmother raps faster!",
    "Switch usage! Now!",
    "Stop recycling rhymes!",
    "You're off beat!",
];

export default function BattlePage() {
    const [taunt, setTaunt] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const beatPlayerRef = useRef<BeatPlayer | null>(null);

    useEffect(() => {
        beatPlayerRef.current = new BeatPlayer();
        AudioContextManager.getInstance().initialize().catch(() => { });
        return () => beatPlayerRef.current?.stop();
    }, []);

    const startBattle = async () => {
        setIsPlaying(true);
        await beatPlayerRef.current?.loadBeat(BEATS[1]);
        beatPlayerRef.current?.start();

        // Taunt loop
        tauntLoop();
    };

    const tauntLoop = () => {
        if (!beatPlayerRef.current) return;

        const randomDelay = Math.random() * 5000 + 3000; // 3-8s
        setTimeout(() => {
            if (!beatPlayerRef.current) return; // check if stopped
            const randomTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
            setTaunt(randomTaunt);

            // Clear taunt after 2s
            setTimeout(() => setTaunt(""), 2000);

            tauntLoop();
        }, randomDelay);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Opponent Avatar Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[500px] h-[500px] bg-red-600 rounded-full blur-[150px]" />
            </div>

            {!isPlaying ? (
                <div className="z-10 text-center space-y-6">
                    <h1 className="text-6xl font-black text-red-500 uppercase glitch-text">CYBER BATTLE</h1>
                    <p className="text-xl text-gray-400">Can you survive the pressure?</p>
                    <button onClick={startBattle} className="bg-red-600 text-white px-10 py-5 rounded-none skew-x-[-12deg] text-2xl font-bold hover:bg-red-500 transition-colors border-2 border-red-800">
                        <span className="skew-x-[12deg] block">ENTER CYPHER</span>
                    </button>
                </div>
            ) : (
                <div className="z-10 text-center w-full max-w-4xl relative min-h-[400px] flex items-center justify-center">
                    {/* Taunt Display */}
                    {taunt && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-7xl md:text-8xl font-black text-white stroke-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] text-stroke"
                            style={{ WebkitTextStroke: "2px red" }}
                        >
                            {taunt}
                        </motion.div>
                    )}

                    {/* Visualizer could go here too */}
                    <div className="absolute bottom-[-100px] left-0 w-full text-center text-sm text-gray-500">
                        OPPONENT AI: <span className="text-red-500 font-bold">LOCKED IN</span>
                    </div>
                </div>
            )}
        </div>
    );
}
