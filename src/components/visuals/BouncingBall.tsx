import type { BeatTiming } from "@/hooks/useBeatTiming";
import { motion } from "framer-motion";

interface BouncingBallProps {
    timing: BeatTiming;
    isActive: boolean;
}

export const BouncingBall = ({ timing, isActive }: BouncingBallProps) => {
    // Convert bar progress (0-1) to beat progress (0-1, four times per bar)
    const beatProgress = (timing.progress * 4) % 1;

    // Jump height in pixels
    const height = 60;

    // Calculate Y position: 0 (ground) -> -height (peak) -> 0 (ground)
    // Sin(0) = 0, Sin(PI/2) = 1, Sin(PI) = 0
    // We want 0->1->0 per beat.
    // beatProgress goes 0->1
    // sin(beatProgress * PI) goes 0 -> 1 -> 0
    const y = -1 * Math.abs(Math.sin(beatProgress * Math.PI)) * height;

    // Flash/Squash on impact (when progress is near 0 or 1)
    // Actually, just check if near ground
    const isGround = y > -5;
    const isDownbeat = timing.beatIndex === 0 && isGround;

    return (
        <div className="relative w-full h-32 flex items-end justify-center mb-8 overflow-hidden pointer-events-none select-none">
            {/* Rail */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent absolute bottom-4" />

            {/* Ball */}
            <motion.div
                className="w-12 h-12 rounded-full absolute bottom-4 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                style={{
                    y: isActive ? y : 0,
                    x: 0, // Could animate L/R later
                    background: "radial-gradient(circle at 30% 30%, #fff, #a855f7)",
                    scaleX: isGround && isActive ? 1.3 : 1,
                    scaleY: isGround && isActive ? 0.7 : 1,
                    filter: isDownbeat && isActive ? "brightness(1.5)" : "brightness(1)",
                }}
                transition={{ duration: 0 }} // Instant update from frame loop
            />

            {/* Beat Markers (Ghost trails or just decor) */}
            <div className="absolute bottom-2 text-xs font-mono text-purple-500/30 flex gap-12">
                <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
        </div>
    );
};
