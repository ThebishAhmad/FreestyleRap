import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={hoverEffect ? { scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.03)" } : undefined}
            className={cn(
                "relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl overflow-hidden rounded-2xl",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
                className
            )}
            {...props}
        >
            {/* Subtle Noise Texture Overlay (Optional, adds grit) */}
            {/* <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none" /> */}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
