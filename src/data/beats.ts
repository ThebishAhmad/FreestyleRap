import type { Beat } from "@/lib/audio/BeatPlayer";

export const BEATS: Beat[] = [
    {
        id: "trap-banger",
        name: "Need for Speed",
        description: "Hard-hitting trap beat with menacing 808 slides, melodic synth stabs, and rapid rolling hi-hats.",
        bpm: 140,
        style: "trap",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 4,
        audioSrc: "/beats/trap-banger.mp3"
    },
    {
        id: "boom-bap-classic",
        name: "90s Golden Era",
        description: "Soulful classic boom-bap with jazz piano chords, dusty vinyl crackle, and acoustic drums.",
        bpm: 92,
        style: "boom-bap",
        bars_per_loop: 4,
        energy_level: 4,
        complexity_level: 3,
        audioSrc: "/beats/boom-bap-classic.mp3"
    },
    {
        id: "melodic-chill",
        name: "Sweet September",
        description: "Chill lofi guitar loop with mellow 808 glide, warm Rhodes keys, and relaxing head-nodding bounce.",
        bpm: 85,
        style: "lofi",
        bars_per_loop: 4,
        energy_level: 3,
        complexity_level: 2,
        audioSrc: "/beats/melodic-chill.mp3"
    },
    {
        id: "dark-drill",
        name: "Thunder & Ice",
        description: "Aggressive UK/NY drill beat with cinematic brass, syncopated snares, and sliding sub-bass.",
        bpm: 142,
        style: "drill",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 5,
        audioSrc: "/beats/dark-drill.mp3"
    },
    {
        id: "west-coast",
        name: "West Coast Anthem",
        description: "Upbeat California bounce with funk bassline, punchy claps, and classic West Coast synths.",
        bpm: 96,
        style: "west-coast",
        bars_per_loop: 4,
        energy_level: 4,
        complexity_level: 3,
        audioSrc: "/beats/west-coast.mp3"
    },
    {
        id: "flute-trap",
        name: "Desert Mirage",
        description: "Hypnotic oriental flute melody with heavy 808s, claps, and energetic trap bounce.",
        bpm: 130,
        style: "trap",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 4,
        audioSrc: "/beats/flute-trap.mp3"
    },
    {
        id: "custom-url",
        name: "Custom MP3 Upload",
        description: "Upload or drag-and-drop any MP3 / WAV from your device.",
        bpm: 120,
        style: "custom",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 5,
        audioSrc: ""
    }
];
