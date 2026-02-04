"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Mic, Headphones, Music, ChevronRight, X } from "lucide-react";

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(true);
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to FlowState",
            desc: "The ultimate freestyle gym. Before we start, let's get you set up.",
            icon: <Music className="w-12 h-12 text-primary" />
        },
        {
            title: "Mic Check",
            desc: "We need microphone access to track your flow and detect silence. No audio is recorded/saved.",
            icon: <Mic className="w-12 h-12 text-secondary" />
        },
        {
            title: "Headphones Recommended",
            desc: "For the best experience and to avoid feedback loops, wear headphones.",
            icon: <Headphones className="w-12 h-12 text-accent" />
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>

                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                            {steps[step].icon}
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {steps[step].title}
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {steps[step].desc}
                        </p>
                    </motion.div>

                    <div className="flex gap-2 justify-center pt-4">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`} />
                        ))}
                    </div>

                    <NeonButton
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else setIsOpen(false);
                        }}
                        className="w-full"
                    >
                        {step < steps.length - 1 ? "Next" : "Let's Flow"} <ChevronRight className="w-4 h-4" />
                    </NeonButton>
                </GlassCard>
            </div>
        </AnimatePresence>
    );
}
