import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { BeatProvider } from "@/contexts/BeatContext";
import { WordPackProvider } from "@/contexts/WordPackContext";
import Home from "@/pages/Home";
// @ts-ignore
import GridScan from "@/components/ui/GridScan";

import Freestyle from "@/pages/Freestyle";
import NoPauseDrill from "@/pages/NoPauseDrill";
import BattleTrainer from "@/pages/BattleTrainer";
import PatternDrill from "@/pages/PatternDrill";

import { SettingsPanel } from "@/components/features/SettingsPanel";
import { Navbar } from "@/components/layout/Navbar";

function AppContent() {
  const location = useLocation();

  return (
    <>
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      <Navbar />
      <SettingsPanel />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/freestyle" element={<Freestyle />} />
          <Route path="/drills" element={<Navigate to="/" replace />} />
          <Route path="/drill/no-pause" element={<NoPauseDrill />} />
          <Route path="/battle" element={<BattleTrainer />} />
          <Route path="/drill/pattern" element={<PatternDrill />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <BeatProvider>
        <WordPackProvider>
          <AppContent />
        </WordPackProvider>
      </BeatProvider>
    </Router>
  );
}
