import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Copy, Check, Volume2, Sparkles, BookOpen } from "lucide-react";
import WORDS_DATA from "@/data/words.json";

interface RhymeVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface WordEntry {
    word: string;
    familyKey: string;
    syllables: number;
}

function countSyllables(word: string): number {
    const w = word.toLowerCase().trim();
    if (w.length <= 3) return 1;
    const match = w.match(/[aeiouy]{1,2}/g);
    return match ? Math.max(1, match.length) : 1;
}

export function RhymeVaultModal({ isOpen, onClose }: RhymeVaultModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedWord, setCopiedWord] = useState<string | null>(null);
    const [activeSyllableFilter, setActiveSyllableFilter] = useState<number | null>(null);

    // Build flattened catalog once
    const { allWords, familyMap } = useMemo(() => {
        const words: WordEntry[] = [];
        const fMap: Record<string, string[]> = WORDS_DATA;
        const keys = Object.keys(fMap);

        keys.forEach((key) => {
            fMap[key].forEach((word) => {
                words.push({
                    word,
                    familyKey: key,
                    syllables: countSyllables(word),
                });
            });
        });

        return { allWords: words, familyMap: fMap };
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Copy to clipboard
    const copyToClipboard = (word: string) => {
        navigator.clipboard?.writeText(word.toLowerCase());
        setCopiedWord(word);
        setTimeout(() => setCopiedWord(null), 1200);
    };

    // Pronounce word
    const speakWord = (word: string) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Filter results based on search query or active syllables
    const filteredResults = useMemo(() => {
        const q = searchQuery.trim().toUpperCase();

        // 1. If user typed a search query
        if (q.length > 0) {
            // Check if exact word exists in a rhyme family
            const matchingWord = allWords.find((w) => w.word === q);
            if (matchingWord) {
                // Return all rhymes from that family
                const familyWords = familyMap[matchingWord.familyKey] || [];
                return familyWords
                    .filter((w) => (activeSyllableFilter ? countSyllables(w) === activeSyllableFilter : true))
                    .map((w) => ({
                        word: w,
                        familyKey: matchingWord.familyKey,
                        syllables: countSyllables(w),
                    }));
            }

            // Otherwise match across word text
            return allWords.filter((w) => {
                const matchesWord = w.word.includes(q);
                const matchesSyllable = activeSyllableFilter ? w.syllables === activeSyllableFilter : true;
                return matchesWord && matchesSyllable;
            });
        }

        // 2. Default view: curated preview of words matching current syllable filter
        return allWords
            .filter((w) => (activeSyllableFilter ? w.syllables === activeSyllableFilter : true))
            .slice(0, 48);
    }, [searchQuery, activeSyllableFilter, allWords, familyMap]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="bg-[#0c0c14] border border-white/10 max-w-3xl w-full rounded-2xl p-6 md:p-7 shadow-2xl relative max-h-[85vh] flex flex-col gap-5 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-lg font-bold text-white tracking-tight">
                                        Rhyme Vault
                                    </h3>
                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                        {allWords.length}+ words
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 font-normal mt-0.5">
                                    Instant rhyme and syllable finder
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Input Bar */}
                    <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type any word to find rhymes (e.g. cold, flame, battle, shine)..."
                            autoFocus
                            className="w-full bg-zinc-900/60 border border-white/[0.1] focus:border-cyan-500/50 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 font-normal outline-none transition-all focus:ring-1 focus:ring-cyan-500/30"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Minimalist Syllable Filter Bar */}
                    <div className="flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-zinc-400 font-medium mr-1">Syllables:</span>
                            {[null, 1, 2, 3].map((syl) => {
                                const isSel = activeSyllableFilter === syl;
                                return (
                                    <button
                                        key={syl ?? "all"}
                                        onClick={() => setActiveSyllableFilter(syl)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            isSel
                                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                                                : "bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.08]"
                                        }`}
                                    >
                                        {syl === null ? "All" : syl === 3 ? "3+ Multi" : `${syl} Syl`}
                                    </button>
                                );
                            })}
                        </div>

                        <span className="text-xs text-zinc-500 font-normal">
                            {filteredResults.length} {filteredResults.length === 1 ? "rhyme" : "rhymes"}
                        </span>
                    </div>

                    {/* Word Results Grid */}
                    <div className="flex-1 overflow-y-auto pr-1 min-h-[220px]">
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-14 flex flex-col items-center justify-center text-zinc-500 gap-2">
                                <Search className="w-8 h-8 stroke-1 text-zinc-600" />
                                <p className="text-sm font-medium text-zinc-400">
                                    No matching rhymes found for "{searchQuery}"
                                </p>
                                <span className="text-xs text-zinc-500">
                                    Try typing a simpler root word (e.g. "shine", "cold", "night").
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {filteredResults.map((item, idx) => {
                                    const isCopied = copiedWord === item.word;
                                    return (
                                        <div
                                            key={`${item.word}-${idx}`}
                                            className="group bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/[0.08] hover:border-cyan-500/40 p-3 rounded-xl transition-all duration-200 flex items-center justify-between shadow-sm"
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-semibold tracking-wide text-white group-hover:text-cyan-300 transition-colors">
                                                    {item.word}
                                                </span>
                                                <span className="text-xs text-zinc-400 font-normal mt-0.5">
                                                    {item.syllables} {item.syllables === 1 ? "syllable" : "syllables"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {/* Pronounce */}
                                                <button
                                                    onClick={() => speakWord(item.word)}
                                                    title="Pronounce"
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/[0.06] transition-colors"
                                                >
                                                    <Volume2 className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Copy */}
                                                <button
                                                    onClick={() => copyToClipboard(item.word)}
                                                    title="Copy Rhyme"
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                                >
                                                    {isCopied ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div className="border-t border-white/[0.08] pt-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            Tip: Match multi-syllable endings for complex rhyme patterns.
                        </span>
                        <span className="hidden sm:inline text-zinc-500">Press ESC to dismiss</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
