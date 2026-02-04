import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface SessionSummaryProps {
    score: number;
    duration: number; // seconds
    warnings: number;
    onRetry: () => void;
}

export function SessionSummary({ score, duration, warnings, onRetry }: SessionSummaryProps) {
    const getBrutalFeedback = () => {
        if (warnings > 5) return "You froze up. Pathetic.";
        if (duration < 30) return "Too short. No stamina?";
        if (score < 10) return "Weak vocabulary. Read a book.";
        return "Not bad. But not great.";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-white/10 p-8 rounded-2xl max-w-md w-full text-center space-y-8"
            >
                <h2 className="text-4xl font-black uppercase tracking-tighter neon-text">Session Report</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground uppercase">Duration</div>
                        <div className="text-2xl font-bold">{duration}s</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground uppercase">Warnings</div>
                        <div className="text-2xl font-bold text-destructive">{warnings}</div>
                    </div>
                    <div className="col-span-2 p-4 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground uppercase">Flow Score</div>
                        <div className="text-4xl font-black text-primary">{Math.round(score * 10)}</div>
                    </div>
                </div>

                <div className="bg-destructive/10 text-destructive p-4 rounded border border-destructive/20 font-bold uppercase italic">
                    "{getBrutalFeedback()}"
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={onRetry} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                        <RefreshCw className="w-4 h-4" /> AGAIN
                    </button>
                    <Link href="/" className="flex items-center gap-2 bg-muted text-muted-foreground px-6 py-3 rounded-full font-bold hover:bg-muted/80 transition-colors">
                        <Home className="w-4 h-4" /> EXIT
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
