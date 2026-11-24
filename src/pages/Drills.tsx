import { PageTransition } from "@/components/layout/page-transition";
import { ArrowLeft, Grid, Sword, Timer, Sparkles, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/neon-button";
import { useBeat } from "@/contexts/BeatContext";
import { triggerSettings } from "@/components/features/SettingsPanel";

const drills = [
    {
        id: "pattern",
        title: "Pattern Trainer",
        description: "Master multi-syllabic AABB, ABAB, and Monorhyme schemes with live 4-beat metronome indicators and rhyme lock detection.",
        icon: Grid,
        gradient: "from-cyan-500/20 via-cyan-400/10 to-blue-500/5",
        glowColor: "rgba(6, 182, 212, 0.4)",
        route: "/drill/pattern",
        tag: "Rhyme Schemes",
        iconBg: "bg-cyan-500/10",
        iconColor: "text-cyan-400",
        tagBg: "bg-cyan-500/10",
        tagText: "text-cyan-300",
        tagBorder: "border-cyan-500/25"
    },
    {
        id: "battle",
        title: "Battle Arena",
        description: "Step in the ring against MC CYBER-9, BIG BOOM, or PHANTOM DRILL. 3-round tournament with authentic crowd cheers & airhorns.",
        icon: Sword,
        gradient: "from-red-500/20 via-red-400/10 to-orange-500/5",
        glowColor: "rgba(239, 68, 68, 0.4)",
        route: "/battle",
        tag: "Battle Arena",
        iconBg: "bg-red-500/10",
        iconColor: "text-red-400",
        tagBg: "bg-red-500/10",
        tagText: "text-red-300",
        tagBorder: "border-red-500/25"
    },
    {
        id: "no-pause",
        title: "No-Pause Survival",
        description: "Eliminate stuttering and train seamless freestyle endurance with live word radar queue, panic tension, and multiplier streaks.",
        icon: Timer,
        gradient: "from-amber-500/20 via-amber-400/10 to-yellow-500/5",
        glowColor: "rgba(245, 158, 11, 0.4)",
        route: "/drill/no-pause",
        tag: "Endurance Drill",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
        tagBg: "bg-amber-500/10",
        tagText: "text-amber-300",
        tagBorder: "border-amber-500/25"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
    }
};

export default function Drills() {
    const { currentBeat } = useBeat();

    return (
        <PageTransition>
            <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 relative bg-transparent flex flex-col justify-between">
                {/* Sub-Header */}
                <div className="max-w-6xl w-full mx-auto flex items-center justify-between pt-4 pb-2 z-20">
                    <Link to="/">
                        <NeonButton variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
                        </NeonButton>
                    </Link>

                    <button
                        onClick={() => triggerSettings("beats")}
                        className="flex items-center gap-2 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono text-zinc-300 hover:border-cyan-400/40 transition-all"
                    >
                        <Music className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Track: <strong>{currentBeat.name}</strong> ({currentBeat.bpm} BPM)</span>
                    </button>
                </div>

                {/* Hero Section & Stats Banner */}
                <div className="max-w-6xl w-full mx-auto text-center pt-4 pb-8 space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 grid place-items-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 tracking-tight uppercase">
                            DRILL CHAMBER
                        </h1>
                        <p className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto">
                            Targeted discipline modes designed to forge cadence dexterity, flow stamina, and live battle supremacy.
                        </p>
                    </div>
                </div>

                {/* Drill Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 pb-12 relative z-10"
                >
                    {drills.map((drill) => (
                        <Link
                            key={drill.id}
                            to={drill.route}
                            className="block h-full group"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="relative h-[440px] rounded-3xl overflow-hidden cursor-pointer transform-gpu transition-all duration-300 group-hover:-translate-y-1.5"
                            >
                                {/* Card Glass Surface */}
                                <div className="absolute inset-0 bg-black/75 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20 shadow-2xl" />

                                {/* Gradient Hover Background */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${drill.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                                />

                                {/* Ambient Glow */}
                                <div
                                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ boxShadow: `0 0 50px ${drill.glowColor}` }}
                                />

                                {/* Card Content */}
                                <div className="relative h-full p-7 flex flex-col justify-between z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className={`
                                                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-normal
                                                ${drill.tagBg} ${drill.tagText} border ${drill.tagBorder}
                                            `}>
                                                {drill.tag}
                                            </span>
                                        </div>

                                        <div className="flex justify-center py-2">
                                            <div className={`${drill.iconBg} p-7 rounded-3xl group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-inner`}>
                                                <drill.icon className={`w-14 h-14 ${drill.iconColor}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-white tracking-tight">
                                            {drill.title}
                                        </h3>
                                        <p className="text-sm text-zinc-300 font-normal leading-relaxed">
                                            {drill.description}
                                        </p>
                                        <div className="flex items-center justify-between text-zinc-400 group-hover:text-cyan-300 transition-colors pt-3 border-t border-white/10">
                                            <span className="text-xs font-semibold">
                                                Enter Chamber
                                            </span>
                                            <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

                {/* Footer Hint */}
                <div className="text-center pb-4 z-10">
                    <p className="text-xs text-zinc-400 font-normal">
                        Tip: You can adjust the tempo (BPM) and beat volume at any time from the top bar.
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}
