import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { BEATS } from "@/data/beats";
import type { Beat } from "@/lib/audio/BeatPlayer";
import { BeatStorage } from "@/lib/storage/BeatStorage";

interface BeatContextType {
    currentBeat: Beat;
    allBeats: Beat[];
    setCurrentBeat: (beat: Beat) => void;
    setBeatBpm: (bpm: number) => void;
    addCustomBeat: (file: File) => Promise<void>;
    removeCustomBeat: (id: string) => Promise<void>;
    volume: number;
    setVolume: (val: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
    metronome: boolean;
    setMetronome: (val: boolean) => void;
}

const BeatContext = createContext<BeatContextType | undefined>(undefined);

export function BeatProvider({ children }: { children: React.ReactNode }) {
    const [currentBeat, setCurrentBeatState] = useState<Beat>(BEATS[0]);
    const [customBeats, setCustomBeats] = useState<Beat[]>([]);
    
    // Persistent Beat Volume (0 - 100)
    const [volume, setVolumeState] = useState<number>(() => {
        try {
            const saved = localStorage.getItem("flowstate_beat_volume");
            if (saved !== null) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
            }
        } catch (e) {
            console.debug("Could not read flowstate_beat_volume:", e);
        }
        return 80;
    });

    const lastUnmutedVolumeRef = useRef<number>(volume > 0 ? volume : 80);

    // Persistent Metronome state
    const [metronome, setMetronomeState] = useState<boolean>(() => {
        try {
            return localStorage.getItem("flowstate_metronome_enabled") === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        // Load saved beats from DB
        BeatStorage.getAllBeats().then(loadedBeats => {
            setCustomBeats(loadedBeats);
        });
    }, []);

    const setCurrentBeat = (beat: Beat) => {
        setCurrentBeatState(beat);
    };

    const setBeatBpm = (bpm: number) => {
        setCurrentBeatState(prev => ({
            ...prev,
            bpm: Math.max(60, Math.min(200, bpm))
        }));
    };

    const addCustomBeat = async (file: File) => {
        const id = `custom-${Date.now()}`;
        const newBeat: Beat = {
            id,
            name: file.name.replace(/\.[^/.]+$/, "").substring(0, 22),
            description: "Custom Uploaded Beat",
            bpm: 120,
            style: "custom",
            bars_per_loop: 4,
            energy_level: 5,
            complexity_level: 5,
            audioSrc: URL.createObjectURL(file)
        };

        // Save to DB
        await BeatStorage.saveBeat(newBeat, file);

        // Update State
        setCustomBeats(prev => [newBeat, ...prev]);
        setCurrentBeatState(newBeat);
    };

    const removeCustomBeat = async (id: string) => {
        await BeatStorage.deleteBeat(id);
        setCustomBeats(prev => prev.filter(b => b.id !== id));
        if (currentBeat.id === id) {
            setCurrentBeatState(BEATS[0]);
        }
    };

    const setVolume = (val: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(val)));
        if (clamped > 0) {
            lastUnmutedVolumeRef.current = clamped;
        }
        setVolumeState(clamped);

        try {
            localStorage.setItem("flowstate_beat_volume", String(clamped));
        } catch (e) {
            console.debug("Could not save volume:", e);
        }

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("flowstate_volume_change", { detail: { volume: clamped } }));
        }
    };

    const toggleMute = () => {
        if (volume > 0) {
            lastUnmutedVolumeRef.current = volume;
            setVolume(0);
        } else {
            setVolume(lastUnmutedVolumeRef.current || 80);
        }
    };

    const isMuted = volume === 0;

    const setMetronome = (val: boolean) => {
        setMetronomeState(val);
        try {
            localStorage.setItem("flowstate_metronome_enabled", String(val));
        } catch (e) {
            console.debug("Could not save metronome:", e);
        }

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("flowstate_metronome_change", { detail: { metronome: val } }));
        }
    };

    const allBeats = [...BEATS, ...customBeats];

    return (
        <BeatContext.Provider value={{
            currentBeat,
            setCurrentBeat,
            allBeats,
            setBeatBpm,
            addCustomBeat,
            removeCustomBeat,
            volume,
            setVolume,
            isMuted,
            toggleMute,
            metronome,
            setMetronome
        }}>
            {children}
        </BeatContext.Provider>
    );
}

export function useBeat() {
    const context = useContext(BeatContext);
    if (context === undefined) {
        throw new Error("useBeat must be used within a BeatProvider");
    }
    return context;
}
