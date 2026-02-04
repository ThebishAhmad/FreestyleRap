"use client";

import Link from "next/link";
import { Mic, Zap, Brain, Swords } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { OnboardingModal } from "@/components/features/OnboardingModal";

export default function Home() {
    return (
        <PageTransition>
            <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 text-center">

                {/* Onboarding Logic */}
                <OnboardingModal />

                <div className="space-y-6 max-w-4xl z-10">
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        FLOW<span className="text-primary drop-shadow-[0_0_20px_rgba(124,58,237,0.8)]">STATE</span>
                    </h1>

                    <p className="text-2xl md:text-3xl text-blue-100/80 font-light tracking-wide max-w-2xl mx-auto">
                        The Academy of Freestyle. <br />
                        <span className="text-lg opacity-60">Master the art of rhyme, rhythm, and flow.</span>
                    </p>

                    <div className="pt-8 flex flex-col items-center gap-6">
                        <Link href="/freestyle">
                            <NeonButton size="xl" className="px-16 py-8 text-2xl">
                                <Mic className="w-8 h-8" /> ENTER THE BOOTH
                            </NeonButton>
                        </Link>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full z-10">
                    <Link href="/warmup">
                        <GlassCard hoverEffect className="p-8 flex flex-col items-center gap-4 group cursor-pointer h-full">
                            <Brain className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold">Warmup Mode</h3>
                            <p className="text-sm text-muted-foreground">Low pressure. Find your voice. Beginner friendly.</p>
                        </GlassCard>
                    </Link>

                    <Link href="/rhyme-trainer">
                        <GlassCard hoverEffect className="p-8 flex flex-col items-center gap-4 group cursor-pointer h-full">
                            <Zap className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold">Rhyme Gym</h3>
                            <p className="text-sm text-muted-foreground">Expand your vocabulary with rapid-fire drills.</p>
                        </GlassCard>
                    </Link>

                    <Link href="/drills">
                        <GlassCard hoverEffect className="p-8 flex flex-col items-center gap-4 group cursor-pointer h-full">
                            <Swords className="w-10 h-10 text-destructive group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold">Battle & Drills</h3>
                            <p className="text-sm text-muted-foreground">High intensity training for advanced MCs.</p>
                        </GlassCard>
                    </Link>
                </div>

            </div>
        </PageTransition>
    );
}
