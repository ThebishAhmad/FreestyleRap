import { Trophy, Zap, ArrowLeft, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { VolumeControl } from "@/components/features/VolumeControl";

interface VersusHeaderProps {
    round: number;
    maxRounds: number;
    score: number;
    combo: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onSurrender: () => void;
}

export function VersusHeader({
    round,
    maxRounds,
    score,
    combo,
    isMuted,
    onToggleMute,
    onSurrender
}: VersusHeaderProps) {
    return (
        <header className="w-full pt-20 px-4 md:px-8 flex items-center justify-between relative z-30 select-none">
            {/* Left: Exit Link & Stats */}
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="p-2 md:px-3 md:py-1.5 rounded-xl bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Hub</span>
                </Link>

                <div className="hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white font-mono font-bold text-xs">
                        {score.toLocaleString()} PTS
                    </span>
                    {combo > 1 && (
                        <span className="text-amber-400 font-mono font-bold text-xs ml-1 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> {combo}x
                        </span>
                    )}
                </div>
            </div>

            {/* Center: VS Badge & Round Tracker */}
            <div className="flex items-center gap-2 bg-black/75 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-xl">
                <span className="text-xs font-mono font-black text-cyan-400 tracking-wider">YOU</span>
                <span className="text-zinc-600 font-mono font-black italic text-xs px-1">VS</span>
                <span className="text-xs font-mono font-black text-red-400 tracking-wider">AI</span>
                <div className="w-[1px] h-3 bg-white/20 mx-1.5" />
                <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                    Round {round}/{maxRounds}
                </span>
            </div>

            {/* Right: Sound Controls & Surrender */}
            <div className="flex items-center gap-2">
                <VolumeControl variant="pill" align="right" />

                <button
                    onClick={onToggleMute}
                    className={`p-2 rounded-xl border backdrop-blur-md transition-colors ${
                        isMuted
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-black/60 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                    title={isMuted ? "Unmute Crowd SFX" : "Mute Crowd SFX"}
                >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                    onClick={onSurrender}
                    className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono font-bold uppercase hover:bg-red-500/20 hover:border-red-500/60 transition-all flex items-center gap-1"
                >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Surrender</span>
                </button>
            </div>
        </header>
    );
}
