import { useState, useRef, useEffect } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeat } from "@/contexts/BeatContext";

interface VolumeControlProps {
    variant?: "pill" | "icon" | "inline";
    className?: string;
    showLabel?: boolean;
    align?: "left" | "right" | "center";
}

const PRESETS = [
    { label: "0%", value: 0 },
    { label: "25%", value: 25 },
    { label: "50%", value: 50 },
    { label: "75%", value: 75 },
    { label: "100%", value: 100 },
];

export function VolumeControl({
    variant = "pill",
    className = "",
    showLabel = true,
    align = "right",
}: VolumeControlProps) {
    const { volume, setVolume, isMuted, toggleMute } = useBeat();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic Volume Icon
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) {
            return <VolumeX className="w-4 h-4 text-red-400 shrink-0" />;
        }
        if (volume < 40) {
            return <Volume className="w-4 h-4 text-zinc-300 shrink-0" />;
        }
        if (volume < 80) {
            return <Volume1 className="w-4 h-4 text-zinc-300 shrink-0" />;
        }
        return <Volume2 className="w-4 h-4 text-white shrink-0" />;
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Inline variant (clean single row used in settings / mobile drawer)
    if (variant === "inline") {
        return (
            <div className={`flex flex-col gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-2xl ${className}`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        title={isMuted ? "Unmute" : "Mute"}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        {getVolumeIcon()}
                    </button>

                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-full appearance-none"
                    />

                    <span className="text-xs font-mono text-zinc-400 min-w-[32px] text-right">
                        {isMuted ? "0%" : `${volume}%`}
                    </span>
                </div>

                {/* Subtle preset notches */}
                <div className="flex justify-between px-1">
                    {PRESETS.map((p) => {
                        const isSelected = (p.value === 0 && isMuted) || (!isMuted && volume === p.value);
                        return (
                            <button
                                key={p.value}
                                onClick={() => setVolume(p.value)}
                                className={`text-[10px] font-mono transition-colors ${
                                    isSelected ? "text-cyan-400 font-bold" : "text-zinc-600 hover:text-zinc-300"
                                }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const alignmentClasses =
        align === "left"
            ? "left-0"
            : align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "right-0";

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            {/* Minimalist Trigger Button */}
            {variant === "pill" ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    title={`Beat Volume: ${isMuted ? "Muted" : `${volume}%`}`}
                    aria-label="Beat Volume"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                        isOpen
                            ? "bg-white/15 border-white/25 text-white"
                            : isMuted
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                    {getVolumeIcon()}
                    {showLabel && (
                        <span className="text-[11px] font-mono">
                            {isMuted ? "0%" : `${volume}%`}
                        </span>
                    )}
                </button>
            ) : (
                /* Icon button */
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    title={`Beat Volume: ${isMuted ? "Muted" : `${volume}%`}`}
                    aria-label="Beat Volume"
                    className={`p-2 rounded-xl border transition-all ${
                        isOpen
                            ? "bg-white/15 border-white/25 text-white"
                            : isMuted
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                    {getVolumeIcon()}
                </button>
            )}

            {/* Clean Minimalist Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute top-full mt-2 z-50 w-56 p-3 rounded-2xl bg-[#0c0c14]/95 border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col gap-2.5 text-left ${alignmentClasses}`}
                    >
                        {/* Slider Row */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={toggleMute}
                                title={isMuted ? "Unmute" : "Mute"}
                                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                {getVolumeIcon()}
                            </button>

                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-full appearance-none"
                            />

                            <span className="text-xs font-mono text-zinc-300 min-w-[32px] text-right">
                                {isMuted ? "0%" : `${volume}%`}
                            </span>
                        </div>

                        {/* Preset Quick Taps */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 px-0.5">
                            {PRESETS.map((p) => {
                                const isSelected = (p.value === 0 && isMuted) || (!isMuted && volume === p.value);
                                return (
                                    <button
                                        key={p.value}
                                        onClick={() => setVolume(p.value)}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                            isSelected
                                                ? "text-cyan-400 font-bold bg-cyan-500/10"
                                                : "text-zinc-500 hover:text-zinc-200"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
