import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Crown,
    Search,
    Trophy,
    BookOpen,
    Music2,
    Sliders,
    Menu,
    X,
    Sparkles,
    Grid,
    Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeat } from "@/contexts/BeatContext";
import { triggerSettings } from "@/components/features/SettingsPanel";
import { VolumeControl } from "@/components/features/VolumeControl";
import { RhymeVaultModal } from "@/components/features/RhymeVaultModal";
import { RapperStatsModal } from "@/components/features/RapperStatsModal";

export function Navbar() {
    const location = useLocation();
    const { currentBeat } = useBeat();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showHandbook, setShowHandbook] = useState(false);
    const [showRhymeVault, setShowRhymeVault] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // Global keyboard shortcut: Ctrl+K or Cmd+K opens Rhyme Vault
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setShowRhymeVault((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-4 md:px-8 py-3 transition-all">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)]">
                            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                                <Crown className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-black text-sm md:text-base tracking-wider text-white">
                                FLOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">STATE</span>
                            </span>
                            <span className="text-[9px] font-mono tracking-widest text-zinc-500 -mt-1 hidden sm:block">
                                RAP ACADEMY
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Center Navigation: Minimalist Utility Suite */}
                    <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/10 px-2 py-1 rounded-full shadow-inner">
                        {/* 1. Rhyme Vault Dictionary Tool */}
                        <button
                            onClick={() => setShowRhymeVault(true)}
                            title="Open Rhyme & Multi-Syllable Vault (Ctrl+K)"
                            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span>Rhyme Vault</span>
                        </button>

                        {/* 2. Career Dossier */}
                        <button
                            onClick={() => setShowStats(true)}
                            title="View Career Records & Achievements"
                            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group cursor-pointer"
                        >
                            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Dossier</span>
                        </button>

                        {/* 3. Rap Masterclass Handbook */}
                        <button
                            onClick={() => setShowHandbook(true)}
                            title="Freestyle Rap Master Guide"
                            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group cursor-pointer"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span>Handbook</span>
                        </button>
                    </nav>

                    {/* Right Side Studio Controls */}
                    <div className="flex items-center gap-2.5">
                        {/* Active Beat Changer Pill */}
                        <button
                            onClick={() => triggerSettings("beats")}
                            title="Click to change active instrumental beat"
                            className="hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 hover:border-cyan-500/40 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all group"
                        >
                            <Music2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="text-zinc-300 font-bold max-w-[120px] truncate">{currentBeat.name}</span>
                            <span className="text-zinc-500 text-[10px] font-bold">({currentBeat.bpm})</span>
                        </button>

                        {/* Dedicated Beat Volume Customization Button */}
                        <VolumeControl variant="pill" align="right" />

                        {/* Studio Settings Drawer Trigger */}
                        <button
                            onClick={() => triggerSettings("audio")}
                            title="Studio Settings & Word Packs"
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
                        >
                            <Sliders className="w-4 h-4" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg bg-white/5 text-zinc-300 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden pt-4 pb-3 border-t border-white/10 mt-3 flex flex-col gap-2 text-left"
                        >
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <Crown className="w-4 h-4 text-cyan-400" />
                                <span>Home Studio</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowRhymeVault(true);
                                }}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <Search className="w-4 h-4 text-purple-400" />
                                <span>Rhyme Vault Dictionary</span>
                            </button>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowStats(true);
                                }}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <Trophy className="w-4 h-4 text-amber-400" />
                                <span>Career Dossier & Records</span>
                            </button>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowHandbook(true);
                                }}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <BookOpen className="w-4 h-4 text-cyan-400" />
                                <span>Freestyle Master Handbook</span>
                            </button>

                            {/* Mobile Beat Volume Slider & Presets */}
                            <VolumeControl variant="inline" className="mt-2" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Rhyme Vault Search Modal */}
            <RhymeVaultModal isOpen={showRhymeVault} onClose={() => setShowRhymeVault(false)} />

            {/* Rapper Career Dossier Modal */}
            <RapperStatsModal isOpen={showStats} onClose={() => setShowStats(false)} />

            {/* Freestyle Rap Handbook Modal */}
            <AnimatePresence>
                {showHandbook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                        onClick={() => setShowHandbook(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0b0b12] border border-white/15 max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 grid place-items-center text-cyan-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Freestyle Rap Master Guide</h3>
                                        <p className="text-sm text-zinc-300 font-medium mt-0.5">Core principles for unstoppable flow & cadence</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHandbook(false)}
                                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 text-zinc-200">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                        1. The 4-Beat Grid
                                    </h4>
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        Hip-hop beats operate in 4/4 time (beats 1, 2, 3, 4). The punchline or rhyming syllable should land precisely on beat 4. Start your line on beat 1 or 2, and guide your words toward the target rhyme on beat 4.
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-bold text-purple-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                        2. Multi-Syllabic Rhymes (Multis)
                                    </h4>
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        Simple rhymes only rhyme the end vowel (cat / bat). Elite lyricists match 2, 3, or 4 syllables: <span className="text-white font-semibold">“Gravity”</span> with <span className="text-white font-semibold">“Depravity”</span>, or <span className="text-white font-semibold">“Elevate”</span> with <span className="text-white font-semibold">“Hesitate”</span>. Use the Rhyme Vault in the top bar to discover multi-syllable schemes!
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                        3. Work Backwards From The Rhyme
                                    </h4>
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        When a word appears on screen (e.g. <span className="text-white font-semibold">“CHAMPION”</span>), don't start talking without knowing the destination! Pick your rhyme first (<span className="text-white font-semibold">“Canyon”</span>), then craft lines that naturally set up that landing.
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-bold text-red-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                        4. Eliminate Filler Words
                                    </h4>
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        Avoid “uh”, “um”, or “you know what I’m sayin”. In the No-Pause Drill, keeping rhythmic flow without filler trains your subconscious to retrieve vocabulary instantly under pressure.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
