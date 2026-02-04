import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Modern geometric sans
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/layout/aurora-background";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "FlowState: Freestyle Rap Academy",
    description: "Browser-only interactive freestyle rap training.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn("min-h-screen font-sans antialiased text-white selection:bg-primary/30", outfit.variable)}>
                <AuroraBackground />
                <main className="relative z-10 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
