import React from "react";
import { motion } from "framer-motion";

interface BattleStageProps {
    children: React.ReactNode;
    isFlashing?: boolean;
}

export function BattleStage({ children, isFlashing = false }: BattleStageProps) {
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-between">
            {/* Ambient Lighting & Stage Spotlight Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Dark Radial Gradient Base */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

                {/* Left (Cyan) Spotlight */}
                <motion.div
                    animate={{
                        opacity: [0.15, 0.35, 0.15],
                        x: [-20, 20, -20]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 left-10 w-96 h-[600px] bg-gradient-to-b from-cyan-500/20 via-cyan-900/5 to-transparent blur-[120px] rounded-full"
                />

                {/* Right (Red/Amber) Spotlight */}
                <motion.div
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        x: [20, -20, 20]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-32 right-10 w-96 h-[600px] bg-gradient-to-b from-red-500/25 via-red-950/10 to-transparent blur-[120px] rounded-full"
                />

                {/* Flash effect on punchline impact */}
                <motion.div
                    animate={{ opacity: isFlashing ? [0, 0.4, 0] : 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 bg-white mix-blend-screen pointer-events-none"
                />

                {/* Subtle Cyber Grid Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-72 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.9)),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] opacity-40" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)] pointer-events-none" />
            </div>

            {/* Main Stage Content */}
            <div className="relative z-10 w-full min-h-screen flex flex-col justify-between max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
