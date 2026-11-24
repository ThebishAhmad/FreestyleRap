import { useState, useEffect, useRef } from "react";
import { Mic, Circle, Download, Play, Pause, Trash2, CheckCircle2 } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { motion, AnimatePresence } from "framer-motion";

interface RecordingModuleProps {
    isRecording: boolean;
    autoArm?: boolean;
    compact?: boolean;
}

export function RecordingModule({ isRecording, autoArm = false, compact = false }: RecordingModuleProps) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isArmed, setIsArmed] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const durationInterval = useRef<number | null>(null);

    useEffect(() => {
        if (autoArm && !isArmed && !mediaRecorder) {
            armRecording();
        }
    }, [autoArm, isArmed, mediaRecorder]);

    useEffect(() => {
        if (isArmed && isRecording && mediaRecorder && mediaRecorder.state === "inactive") {
            startRecording();
        } else if (!isRecording && mediaRecorder && mediaRecorder.state === "recording") {
            stopRecording();
        }
    }, [isRecording, isArmed, mediaRecorder]);

    const armRecording = async () => {
        try {
            if (!navigator?.mediaDevices?.getUserMedia) return;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                chunksRef.current = [];
            };

            setMediaRecorder(recorder);
            setIsArmed(true);
        } catch (err) {
            console.warn("Could not arm recording (mic permission required):", err);
        }
    };

    const startRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "inactive") {
            chunksRef.current = [];
            setDuration(0);
            setAudioUrl(null);
            mediaRecorder.start();

            durationInterval.current = window.setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (durationInterval.current) clearInterval(durationInterval.current);
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    };

    const togglePlayPreview = () => {
        if (!audioUrl) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => setIsPlayingPreview(false);
        }

        if (isPlayingPreview) {
            audioRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlayingPreview(true);
            }).catch(console.warn);
        }
    };

    const downloadRecording = () => {
        if (!audioUrl) return;
        const a = document.createElement("a");
        a.href = audioUrl;
        a.download = `flowstate-verse-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const discardRecording = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setIsPlayingPreview(false);
        setDuration(0);
    };

    // Format mm:ss
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex items-center gap-3 pointer-events-auto">
            {/* When Recording is Live */}
            {isRecording && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Circle className="w-2.5 h-2.5 text-red-500 fill-current animate-ping" />
                    <span className="text-xs font-mono font-bold text-red-400">
                        REC {formatTime(duration)}
                    </span>
                </div>
            )}

            {/* When Recording Is Ready for Review */}
            <AnimatePresence>
                {!isRecording && audioUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 bg-black/80 border border-cyan-500/30 px-3 py-1 rounded-full shadow-lg backdrop-blur-md"
                    >
                        <button
                            onClick={togglePlayPreview}
                            className="p-1.5 rounded-full hover:bg-white/10 text-cyan-400 transition-colors"
                            title={isPlayingPreview ? "Pause Preview" : "Play Preview"}
                        >
                            {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <span className="text-xs font-mono text-zinc-300">
                            Verse ({formatTime(duration || 1)})
                        </span>

                        <button
                            onClick={downloadRecording}
                            className="p-1.5 rounded-full hover:bg-white/10 text-green-400 transition-colors"
                            title="Download Audio (.webm)"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={discardRecording}
                            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Discard Recording"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Arm Manual Button if not armed and not compact */}
            {!isArmed && !autoArm && !compact && (
                <NeonButton size="sm" variant="ghost" onClick={armRecording}>
                    <Mic className="w-4 h-4 mr-2" /> ARM MIC
                </NeonButton>
            )}
        </div>
    );
}
