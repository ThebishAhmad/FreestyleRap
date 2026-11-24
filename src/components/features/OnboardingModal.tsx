import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { Mic, Headphones, ArrowRight, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
    onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [micError, setMicError] = useState(false);

    const handleMicPermission = async () => {
        try {
            await AudioContextManager.getInstance().initialize();
            setStep(1);
        } catch (e) {
            console.error(e);
            setMicError(true);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <GlassCard className="max-w-md w-full p-8 flex flex-col items-center text-center gap-6 border-white/10 shadow-2xl">
                    {step === 0 && (
                        <>
                            <div className="p-4 rounded-full bg-primary/20 text-primary border border-primary/30">
                                <Mic className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/80">
                                Microphone Calibration
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                FLOWSTATE uses low-latency microphone analysis to monitor your voice, measure silence, and evaluate your flow in real-time.
                            </p>
                            {micError && (
                                <p className="text-amber-400 text-xs">
                                    Mic permission was not granted. You can still practice with all beats & prompts in Offline Flow mode!
                                </p>
                            )}

                            <div className="flex flex-col gap-3 w-full">
                                <NeonButton onClick={handleMicPermission} className="w-full">
                                    Enable Microphone
                                </NeonButton>
                                <button
                                    onClick={onComplete}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors py-1"
                                >
                                    Skip & Enter Booth (Offline / Beats-Only)
                                </button>
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <div className="p-4 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                                <Headphones className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Use Headphones</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                For optimal rhythm synchronization and to prevent the microphone from picking up the instrumental beat, headphones are strongly recommended.
                            </p>

                            <NeonButton onClick={onComplete} className="w-full">
                                Enter The Booth <ArrowRight className="w-4 h-4 ml-2" />
                            </NeonButton>
                        </>
                    )}
                </GlassCard>
            </motion.div>
        </AnimatePresence>
    );
}
