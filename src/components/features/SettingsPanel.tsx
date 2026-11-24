import { useState, useEffect } from "react";
import { Settings, X, Upload, Trash2, Sliders, Volume2, Bell, Zap, Music2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeat } from "@/contexts/BeatContext";
import { useWordPack } from "@/contexts/WordPackContext";
import { FlowingMenu } from "@/components/ui/FlowingMenu";
import { VolumeControl } from "@/components/features/VolumeControl";

type Tab = "beats" | "wordpacks" | "audio";

export const triggerSettings = (tab?: Tab) => {
    window.dispatchEvent(new CustomEvent("open-flowstate-settings", { detail: { tab } }));
};

export function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("beats");

    const { currentBeat, setCurrentBeat, allBeats, addCustomBeat, removeCustomBeat, setBeatBpm, volume, setVolume, metronome, setMetronome } = useBeat();
    const { activeWordPack, setWordPack, availablePacks } = useWordPack();

    useEffect(() => {
        const handler = (e: any) => {
            setIsOpen(true);
            if (e.detail?.tab) setActiveTab(e.detail.tab);
        };
        window.addEventListener("open-flowstate-settings", handler);
        return () => window.removeEventListener("open-flowstate-settings", handler);
    }, []);

    const beatImages: Record<string, string> = {
        "trap-banger": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
        "boom-bap-classic": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop",
        "melodic-chill": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop",
        "dark-drill": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
        "west-coast": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        "flute-trap": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop",
        "custom-url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
    };

    const beatItems = allBeats.map(beat => ({
        text: beat.name,
        image: beatImages[beat.id] || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
        link: "#",
        onClick: () => setCurrentBeat(beat),
        isActive: currentBeat.id === beat.id,
        description: `${beat.style.toUpperCase()} • ${beat.bpm} BPM`,
        actionIcon: beat.id.startsWith("custom-") ? <Trash2 className="w-3 h-3" /> : undefined,
        onAction: beat.id.startsWith("custom-") ? () => removeCustomBeat(beat.id) : undefined
    }));

    const packItems = availablePacks.map(pack => ({
        text: pack.name,
        image: "https://images.unsplash.com/photo-1456324504439-367cee13d643?q=80&w=600&auto=format&fit=crop",
        link: "#",
        onClick: () => setWordPack(pack.id),
        isActive: activeWordPack.id === pack.id,
        description: `${Object.keys(pack.rhyme_map).length} Rhyme Families`
    }));

    return (
        <>
            {/* Quick floating action in bottom-right corner to never collide with top headers */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="fixed bottom-6 right-6 z-[60] hidden md:block"
            >
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Studio Settings & Beat Selection"
                    className="
                        group relative
                        w-12 h-12 rounded-full 
                        bg-black/60 backdrop-blur-xl
                        border border-white/10
                        grid place-items-center
                        hover:border-primary/50 hover:bg-white/5
                        transition-all duration-300
                        shadow-2xl shadow-black/80
                    "
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Settings className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors relative z-10" />
                </motion.button>
            </motion.div>

            {/* Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
                        />

                        {/* Slide-out Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-md bg-[#07070b]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col h-screen"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                            {/* Header */}
                            <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10 z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 grid place-items-center">
                                        <Sliders className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-white tracking-tight uppercase">Studio Controls</h2>
                                        <p className="text-[11px] text-zinc-500 font-mono">BPM // Beats // Word Packs</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="px-6 pt-4 pb-2 z-10 shrink-0">
                                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setActiveTab("beats")}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "beats"
                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-md"
                                            : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <Music2 className="w-3.5 h-3.5" /> Beats
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("wordpacks")}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "wordpacks"
                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md"
                                            : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <BookOpen className="w-3.5 h-3.5" /> Words
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("audio")}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "audio"
                                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md"
                                            : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <Sliders className="w-3.5 h-3.5" /> Mixer
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative z-10 min-h-0 overflow-y-auto">
                                {activeTab === "beats" && (
                                    <div className="h-full flex flex-col p-4 gap-4">
                                        {/* Upload Card */}
                                        <div
                                            className="p-4 border border-dashed border-white/10 rounded-2xl text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer relative overflow-hidden group"
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#22d3ee"; }}
                                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                                const file = e.dataTransfer.files[0];
                                                if (file && file.type.startsWith("audio/")) {
                                                    addCustomBeat(file);
                                                }
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) addCustomBeat(file);
                                                }}
                                            />
                                            <div className="w-9 h-9 rounded-full bg-white/5 grid place-items-center mx-auto mb-2 group-hover:scale-110 transition-transform text-cyan-400">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white block">Drop or Upload Custom MP3</span>
                                            <span className="text-[11px] text-zinc-500">Stored locally in your browser</span>
                                        </div>

                                        {/* Beat List */}
                                        <div className="flex-1 w-full relative">
                                            <FlowingMenu
                                                items={beatItems}
                                                bgColor="transparent"
                                                marqueeBgColor="#22d3ee"
                                                marqueeTextColor="#000"
                                                borderColor="rgba(255,255,255,0.1)"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "wordpacks" && (
                                    <div className="h-full w-full p-4">
                                        <FlowingMenu
                                            items={packItems}
                                            bgColor="transparent"
                                            marqueeBgColor="#a855f7"
                                            marqueeTextColor="#fff"
                                            borderColor="rgba(255,255,255,0.1)"
                                        />
                                    </div>
                                )}

                                {activeTab === "audio" && (
                                    <div className="p-6 flex flex-col gap-6">
                                        {/* BPM Control */}
                                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tempo (BPM)</span>
                                                <span className="text-xl font-mono font-black text-cyan-400">{currentBeat.bpm} BPM</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={70}
                                                max={160}
                                                step={2}
                                                value={currentBeat.bpm}
                                                onChange={(e) => setBeatBpm(Number(e.target.value))}
                                                className="w-full accent-cyan-400 cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                                <span>70 (Slow / Lofi)</span>
                                                <span>90 (Boom Bap)</span>
                                                <span>140 (Trap / Drill)</span>
                                                <span>160</span>
                                            </div>
                                        </div>

                                        {/* Master Beat Volume Customization */}
                                        <VolumeControl variant="inline" />

                                        {/* Metronome Click Toggle */}
                                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-amber-400" /> Metronome Click
                                                </span>
                                                <span className="text-xs text-zinc-400 mt-0.5">Audible pulse on every beat</span>
                                            </div>
                                            <button
                                                onClick={() => setMetronome(!metronome)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${metronome
                                                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                                                    : "bg-white/10 text-zinc-400 hover:text-white"
                                                    }`}
                                            >
                                                {metronome ? "ON" : "OFF"}
                                            </button>
                                        </div>

                                        {/* Pro Tip Card */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-purple-950/30 border border-white/10 text-xs text-zinc-400 flex flex-col gap-1.5">
                                            <span className="font-bold text-white flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Pro Freestyle Tip
                                            </span>
                                            <p className="leading-relaxed">
                                                When starting out, reduce tempo to 80-90 BPM to give your brain extra milliseconds to find the end-rhymes!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
