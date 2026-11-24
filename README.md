# FLOWSTATE // Freestyle Rap Trainer & AI Battle Arena

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tone.js](https://img.shields.io/badge/Tone.js-15.1-f59e0b.svg?style=flat-square)](https://tonejs.github.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)

**FLOWSTATE** is an interactive, low-latency web application designed to help aspiring and seasoned freestyle rappers hone their improvisational skills, cadence, multi-syllabic rhyming, and stage presence.

---

## ⚡ Key Features

### 1. 🎤 Freestyle Gym (`/freestyle`)
- **Continuous Beat Synchronization:** Low-latency Web Audio playback powered by Tone.js with synthesized 808s, chords, kicks, and rolling trap hats.
- **Neurolinguistic Prompt Engine:** Dynamic word prompts categorized across 10 hip-hop themes with difficulty levels (*Beginner*, *Intermediate*, *Master*).
- **Rhyme Assists:** Displays 4 multi-syllabic rhyme suggestions underneath every active word to prevent choking or stumbling.
- **Rhythm 4-Beat Grid:** Visual step sequencer that reinforces landing rhymes on beat 4.
- **Audio Monitor & Speech Recognition:** Live waveform visualizer and filler word detection (*"um", "uh", "like"*).
- **In-App Rap Recording:** Record full freestyle takes with one-click preview playback, timer, and optional download without intrusive auto-downloads.

### 2. ⚔️ Battle Arena (`/battle`)
- **AI Opponents:** Face 3 distinct AI opponents with unique voice cadences, pitches, and roasts:
  - **MC CYBER-9:** Futuristic algorithmic spitter.
  - **BIG BOOM:** 90s Bronx boom-bap heavyweight.
  - **PHANTOM DRILL:** Aggressive UK drill roaster.
- **Crowd Hype Meter:** Live audience energy tracking that rewards rapid delivery and flow combos.
- **Counter-Rhyme Suggestions:** When the AI drops a punchline, FLOWSTATE analyzes the roast and delivers instant counter-rhymes for the user's turn!
- **Battle Stats Summary:** Final score, rounds survived, and battle rank awards.

### 3. 🎯 Pattern Trainer (`/drill/pattern`)
- **Rhyme Scheme Mastery:** Practice structural rhyming formats including Couplets (**AABB**), Alternate (**ABAB**), and Mono (**AAAA**).
- **Focus Scroll Mode:** Viewport automatically locks onto the active bar and beat.
- **Custom Game Modes:** Easy, Punchline-only, Cliff-only, and Hidden.

### 4. ⏱️ No-Pause Survival Drill (`/drill/no-pause`)
- **Stamina & Filler Killer:** Continuous rap mode where more than 0.9s of silence triggers instant failure.
- **Word Prompt Stream:** Rapidly changing prompt ticker with countdown timer.
- **Personal Best Tracking:** High-score survival time saved persistently in `localStorage`.
- **Flow Ranks:** Earn titles ranging from *Rookie Breather* to *Untouchable God of Flow*.

### 5. 🎛️ Studio Mixer & Custom Beats
- **6 Built-in Synthesizer Instrumentals:**
  - *Pro Trap Banger* (140 BPM)
  - *UK Drill Phantom* (142 BPM)
  - *90s Golden Era* (92 BPM)
  - *West Coast Bounce* (96 BPM)
  - *Midnight Lofi Flow* (82 BPM)
  - *Neo-Tokyo Grime* (138 BPM)
- **Custom Beat Support:** Drag-and-drop any MP3 or WAV file; stored automatically in IndexedDB for offline persistence.
- **Tempo & Metronome:** Dynamic BPM slider (70–160 BPM), master volume slider, and audible metronome click toggle.
- **Freestyle Handbook:** In-app educational guide breaking down the 4-beat grid, multis, working backward from the rhyme, and breath control.

---

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Audio Synthesis & Scheduling:** Tone.js (Web Audio API)
- **Styling & UI:** Tailwind CSS, Framer Motion animations
- **Visuals:** Three.js and custom procedural GLSL grid scanning shader
- **Storage:** IndexedDB (for custom beats) and `localStorage` (for high scores & word packs)
- **Speech API:** Web Speech Recognition API & Web SpeechSynthesis

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/flowstate-rap.git
cd flowstate-rap

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎙️ Recommended Setup
- **Headphones:** Highly recommended to prevent audio feedback between the microphone and instrumental beats.
- **Browser:** Chromium-based browsers (Google Chrome, Microsoft Edge, Brave) provide full Web Audio & Web Speech Recognition support.
