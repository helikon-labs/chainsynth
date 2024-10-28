<p align="center">
    <img width="700" src="https://raw.githubusercontent.com/helikon-labs/chainsynth/development/readme_files/chainsynth_logo.png">
</p>

ChainSynth ([alpha.chainsynth.app](https://alpha.chainsynth.app)) is the first step in the creation of a generative audio-visual synthesizer working with real-time blockchain data.

<p align="center">
    <a href="https://alpha.chainsynth.app" target="_blank"><img width="100%" src="https://raw.githubusercontent.com/helikon-labs/chainsynth/development/readme_files/screenshot_01.png"></a>
</p>

---

🚧 This project is under progress, and this repo is subject to frequent change.

---

## How it works

ChainSynth currently is a very early version of a generative audio-visual synthesizer that works with real-time blockchain data. It currently works only with the Polkadot relay chain data.

It updates the generated audio at every finalized block as explained below.

-   Modulo of the block hash determines the root note and the scale, from the following set:
    1. C Lydian
    2. F Major
    3. D Major
    4. G Major
    5. A Major
    6. G Whole-Tone
-   Number of events in the block defines the speed of the succession of the melody notes.
-   Number of extrinsics defines the depth of reverb applied to the melody.

## Build & Run

```
git clone https://github.com/helikon-labs/chainsynth.git
cd chainsynth
npm install
npm run dev
```

ChainSynth should be running at `localhost:8080`.

## Tips and Nominations

Tips to [Helikon](https://github.com/helikon-labs) Polkadot account much welcome: `15fTH34bbKGMUjF1bLmTqxPYgpg481imThwhWcQfCyktyBzL`

Helikon Polkadot validator `🏔 HELIKON 🏔/ISTANBUL`: `123kFHVth2udmM79sn3RPQ81HukrQWCxA1vmTWkGHSvkR4k1`
