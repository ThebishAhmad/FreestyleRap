"use client";

import Link from "next/link";
import { Zap, Timer, Flame, Swords, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";

const DRILLS = [
    {
        id: "no-pause",
        name: "No-Pause Drill",
        description: "Silence > 0.8s = IMMEDIATE FAILURE. Keep talking.",
        icon: Zap,
        color: "text-secondary",
        href: "/drills/no-pause"
    },
    {
        id: "bar-builder",
        name: "Bar Builder",
        description: "Construct rhymes line by line. (Coming Soon)",
        icon: Timer,
        color: "text-primary",
        href: "#", // Placeholder
    },
    {
        id: "battle",
        name: "Battle Simulator",
        description: "Face off against AI interruptions.",
        icon: Swords,
        color: "text-destructive",
        href: "/battle"
    }
];

export default function DrillsPage() {
    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center p-6">

                <header className="w-full max-w-6xl mb-12 flex justify-between items-center z-10">
                    <Link href="/" className="text-muted-foreground hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Home
                    </Link>
                    <span className="text-sm uppercase tracking-widest text-primary">Drill Chamber</span>
                </header>

                <div className="max-w-6xl w-full z-10">
                    <h1 className="text-6xl font-black mb-12 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Choose Your Pain
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DRILLS.map((drill) => (
                            <Link key={drill.id} href={drill.href}>
                                <GlassCard hoverEffect className="p-8 h-full flex flex-col justify-between group">
                                    <div>
                                        <drill.icon className={`w-12 h-12 mb-6 ${drill.color} group-hover:scale-110 transition-transform`} />
                                        <h3 className="text-2xl font-bold mb-2 uppercase">{drill.name}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{drill.description}</p>
                                    </div>
                                    <div className="mt-8 text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        Enter Drill <span className="text-xl">→</span>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
