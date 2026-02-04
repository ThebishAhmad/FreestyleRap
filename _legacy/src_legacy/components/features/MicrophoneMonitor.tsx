"use client";

import { useEffect, useRef, useState } from "react";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";

interface MicrophoneMonitorProps {
    onSilence?: (isSilent: boolean) => void;
    renderVisualizer?: (analyser: AnalyserNode) => React.ReactNode;
}

export function MicrophoneMonitor({ onSilence, renderVisualizer }: MicrophoneMonitorProps) {
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [isSilent, setIsSilent] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        const initMic = async () => {
            try {
                const manager = AudioContextManager.getInstance();
                await manager.initialize();
                setAnalyser(manager.getAnalyser());
                setHasPermission(true);
            } catch (err) {
                setHasPermission(false);
            }
        };
        initMic();
    }, []);

    // Silence Detection Loop
    useEffect(() => {
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Threshold for silence (adjustable)
            const SILENCE_THRESHOLD = 10;
            const silent = average < SILENCE_THRESHOLD;

            if (silent !== isSilent) {
                setIsSilent(silent);
                onSilence?.(silent);
            }

            requestAnimationFrame(checkVolume);
        };

        requestAnimationFrame(checkVolume);
    }, [analyser, isSilent, onSilence]);

    if (hasPermission === false) {
        return <div className="text-destructive">Microphone Access Denied</div>;
    }

    if (!analyser) {
        return <div className="text-muted-foreground animate-pulse">Initializing Mic...</div>;
    }

    return (
        <div className="w-full">
            {renderVisualizer ? renderVisualizer(analyser) : null}
            {/* Debug Info (Optional) */}
            {/* <div className="text-xs text-muted-foreground">Silence: {isSilent ? "YES" : "NO"}</div> */}
        </div>
    );
}
