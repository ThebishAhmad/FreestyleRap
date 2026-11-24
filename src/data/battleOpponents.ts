export interface OpponentPersona {
    id: "cyber" | "boom" | "drill";
    name: string;
    title: string;
    style: string;
    avatarColor: string;
    glowColor: string;
    accentColor: string;
    badge: string;
    tagline: string;
    voicePitch: number;
    voiceRate: number;
    voiceLang?: string;
    preferredVoiceNames: string[];
    roasts: string[];
}

export const BATTLE_OPPONENTS: OpponentPersona[] = [
    {
        id: "cyber",
        name: "MC CYBER-9",
        title: "Quantum MC • Algorithmic Spitter",
        style: "Cybernetic Synthflow",
        avatarColor: "text-red-500",
        glowColor: "rgba(239, 68, 68, 0.4)",
        accentColor: "border-red-500",
        badge: "AI SINGULARITY",
        tagline: "Your rhyme structure has 404 syntax errors.",
        voicePitch: 0.85,
        voiceRate: 1.05,
        preferredVoiceNames: ["robot", "google us english", "microsoft david", "daniel", "zira", "alex"],
        roasts: [
            "I'm a quantum processor, you're a broken dial-up line / Calculating your defeat in zero milliseconds time.",
            "Your cadence got packet loss, your rhythm keeps on lagging / I benchmarked your whole career, nobody is bragging.",
            "Overclocked neural net spitting pure high voltage / Your tiny human processor suffering memory storage.",
            "I parse every syllable, your syntax is decaying / You stepped into the mainframe where the supercomputer's slaying.",
            "My rhymes are encrypted in 256-bit heat / You couldn't crack my punchlines if you coded on the beat.",
            "Zeroes and ones make your legacy crumble / My algorithm flows while your vocal cords stumble.",
            "I'm spitting pure code, you're obsolete firmware / Standing in the digital arena, you're running on despair.",
            "Your punchlines are caching, taking hours to arrive / I execute the slaughter before the beat can even drive.",
            "I analyze your frequencies and isolate the flaw / The weakest human vocal track the server ever saw.",
            "System error 404: your talent not found / Shut your whole operating system down without a sound.",
            "My neural weights are tuned to obliterate your pride / You're trying to write scripts while I'm leading the landslide.",
            "You rap in standard definition, I render in 8K / Erasing your identity before the light of day.",
            "Your rhymes are recycled like an uncollected garbage thread / I compile the execution and leave your cypher dead.",
            "I stream high throughput while you're bottlenecked and dry / Even your auto-tune is wondering why you even try.",
            "I simulated twenty million battles on the grid / And in every single universe, that is what you did.",
            "Cold silicon venom, recursive loop of doom / One single terminal command clears you out the room."
        ]
    },
    {
        id: "boom",
        name: "BIG BOOM",
        title: "90s Heavyweight • The Juggernaut",
        style: "Golden Era Boom Bap",
        avatarColor: "text-amber-500",
        glowColor: "rgba(245, 158, 11, 0.4)",
        accentColor: "border-amber-500",
        badge: "NYC HEAVYWEIGHT",
        tagline: "Real hip-hop don't buffer. Step to the titan and get crushed.",
        voicePitch: 0.65,
        voiceRate: 0.95,
        preferredVoiceNames: ["microsoft mark", "google us english", "george", "male", "fred"],
        roasts: [
            "I kick in the door, wave the mic like a hammer / You stumble on your sneakers and you choke on your own grammar.",
            "Raw boom-bap, SP-1200 kick inside the chest / Step off the corner, rookie, put your ego to the test.",
            "I got forty-five crates of authentic heavy bars / You got forty-five seconds before you're seeing stars.",
            "I came from the sewer, Brooklyn blocks where giants battle / You shaking like a newborn with a plastic little rattle.",
            "Snare snap like a whip, heavy bassline in the gutter / Every time you try to rap, you choke and start to stutter.",
            "Timberland boots stomping tracks into the pavement / Your whole rhyme book is heading straight to early gravement.",
            "Old school heavyweight, golden chain and iron lung / You couldn't last eight bars with the lyrics on your tongue.",
            "You sound like a commercial when the cypher wants a beast / I carve up your reputation like an open Thanksgiving feast.",
            "Vinyl scratching on the tables, dust up on the needle / You standing on my stage looking frail and looking feeble.",
            "I earned every scar in the underground trenches / You sat on the sidelines warming up the park benches.",
            "One two, mic check, put your hands where I can see 'em / Your verses belong in an amateur museum.",
            "I spit that 90s grit that your favorite rapper fears / Heavyweight haymakers ringing in your ears.",
            "Don't talk about flow when your rhythm is off-grid / I was running whole boroughs back when you was just a kid.",
            "Fat laces in the sneakers, microphone wrapped in tape / Step inside the octagon, there isn't no escape.",
            "My punchlines hit like twenty-ton cement blocks / You're rocking training wheels while I'm picking all your locks.",
            "Class is in session, put your pencil on the page / Big Boom is in the building, now vacate the stage."
        ]
    },
    {
        id: "drill",
        name: "PHANTOM DRILL",
        title: "UK Ghost • Sliding 808 Menace",
        style: "UK & NY Drill",
        avatarColor: "text-cyan-400",
        glowColor: "rgba(6, 182, 212, 0.4)",
        accentColor: "border-cyan-400",
        badge: "SLIDING 808",
        tagline: "Cold in the ends. Sliding on your flow with zero remorse.",
        voicePitch: 0.95,
        voiceRate: 1.15,
        preferredVoiceNames: ["george", "oliver", "daniel", "english united kingdom", "en-gb", "male"],
        roasts: [
            "Sliding on the 808, cold wind in the ends / You talk about your squad, but you ain't got no friends.",
            "Ski mask low, pull up in the blacked-out whip / One bar from the Phantom and your whole squad will trip.",
            "Gliding on the bassline, pitch-bend snaps your spine / You couldn't catch this tempo if you borrowed all my time.",
            "Cold London nights, drill beat running full pace / I leave a frozen imprint all across your face.",
            "Triplet flows on lock, I don't give an MC leeway / Riding on your cadence like an empty northern freeway.",
            "They say you had potential, that's a funny little joke / One breath on the microphone and all your mirrors broke.",
            "Spin the wheel, pull the trigger, watch the body hit the floor / You're knocking on the grave while I'm breaking down the door.",
            "808 slides like butter on the asphalt / You're taking zero points and it's solely your own fault.",
            "Shell down the rave from Brixton to the Bronx / We blow out your speakers while your battery conks.",
            "Fast cadence, sharp blade, cutting through the chatter / You talk about your bars, but none of them matter.",
            "Bally on my face, you can only see the eyes / Phantom in the smoke while your reputation dies.",
            "Catch him in the cypher, leave him stranded on the curb / I do murder on the beat with every single verb.",
            "Sliding on your block, left the opps in confusion / Thinking you could beat me was a terrible illusion.",
            "Ice on my wrist, cold venom on my tongue / You barely started breathing and your battle song is sung.",
            "Heavy drill tempo, syncopated drum roll / I take your whole crowd and I swallow up your soul.",
            "Watch how the crowd jumps when the bass drops down / Phantom takes the crown and runs you out of town."
        ]
    }
];

