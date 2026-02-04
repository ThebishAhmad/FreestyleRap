"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MetronomeProps {
    bpm: number;
    isPlaying: boolean;
    className?: string;
}

export function Metronome({ bpm, isPlaying, className }: MetronomeProps) {
    const [beat, setBeat] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = (60 / bpm) * 1000;
        const timer = setInterval(() => {
            setBeat(prev => (prev + 1) % 4);
        }, interval);

        return () => clearInterval(timer);
    }, [bpm, isPlaying]);

    return (
        <div className={`flex gap-4 justify-center items-center ${className}`}>
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: beat === i ? [1, 1.5, 1] : 1,
                        opacity: beat === i ? 1 : 0.3,
                        backgroundColor: beat === i ? (i === 0 ? "#ef4444" : "#ffffff") : "#ffffff"
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
            ))}
        </div>
    );
}
