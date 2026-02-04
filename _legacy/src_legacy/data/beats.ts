export const BEATS = [
    {
        id: "1",
        name: "Classic Boom Bap",
        bpm: 90,
        // Using a reliable placeholder loop or public domain beat
        url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg", // PL, need real beats
        // Actually, for "Freestyle", let's use a placeholder beat from a free source if possible or just silence for now?
        // Using a sample MP3 for testing.
        // PRO TIP: In a real app, these would be local assets or S3 links.
    },
    {
        id: "2",
        name: "Trappy Vibes",
        bpm: 140,
        url: "https://actions.google.com/sounds/v1/science_fiction/scifi_laser_machine_gun.ogg", // PL
    }
];

// NOTE: I am using random google sounds as placeholders because I cannot browse the web for real beats effectively without potentially hitting copyright or broken links.
// The user should replace these with real beat files in `public/beats/`.
