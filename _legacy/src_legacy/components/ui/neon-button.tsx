import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isLoading?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function NeonButton({
    children,
    variant = "primary",
    isLoading,
    size = "md",
    className,
    ...props
}: NeonButtonProps) {

    const variants = {
        primary: "bg-primary text-primary-foreground border-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]",
        secondary: "bg-secondary/10 text-secondary border-secondary/50 hover:bg-secondary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
        danger: "bg-destructive/10 text-destructive border-destructive/50 hover:bg-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent shadow-none"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        xl: "px-10 py-6 text-2xl font-bold"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className={cn(
                "relative rounded-full font-bold transition-all duration-300 border flex items-center justify-center gap-3 overflow-hidden group",
                variants[variant],
                sizes[size],
                isLoading && "opacity-70 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {children}
        </motion.button>
    );
}
