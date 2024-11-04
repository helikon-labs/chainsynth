import * as Tone from 'tone';
import { Constants } from '../util/constants';
import { EventBus } from '../event/event-bus';
import { ChainSynthEvent } from '../event/event';
import { BlockInfo } from '@polkadot-api/observable-client';
import { Note } from 'tonal';
import { volumePercentageToDb } from '../util/audio-util';
import { BassParameters, MelodyParameters, NewFinalizedBlockEvent, Signal } from '../data/types';

const map = (value: number, x1: number, y1: number, x2: number, y2: number): number =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

class Synth {
    private readonly eventBus = EventBus.getInstance();
    private isStarted = false;
    private mainChannel!: Tone.Channel;
    private sendReverb!: Tone.Freeverb;
    private sendDelay!: Tone.FeedbackDelay;

    private bassChannel!: Tone.Channel;
    // bass root
    private bassRootOsc!: Tone.Oscillator;
    private bassRootChannel!: Tone.Channel;
    // bass octave
    private bassOctaveOsc!: Tone.FatOscillator;
    private bassOctaveChannel!: Tone.Channel;
    // bass fifth
    private bassFifthOsc!: Tone.FatOscillator;
    private bassFifthChannel!: Tone.Channel;
    // bass LP filter
    private bassLowpassFilter!: Tone.Filter;
    // bass send channels
    private bassReverbSendChannel!: Tone.Channel;

    // melody
    private melodySynth!: Tone.Synth;
    private melodySynthChannel!: Tone.Channel;
    // melody LP filter
    private melodySynthLowpassFilter!: Tone.Filter;
    // melody send
    private melodySynthDelaySendChannel!: Tone.Channel;

    private rootIndex: number = 0;
    private signal = Signal.X24;
    private cycle = 0;

    /*
    private roots: [string, string[]][] = [
        ['C1', ['C3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'B3']],
        ['F1', ['F3', 'G3', 'A3', 'A#3', 'C4', 'D4', 'E4']],
        ['D1', ['D3', 'E3', 'F#3', 'G#3', 'A3', 'B3', 'C#4']],
        ['G1', ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4']],
        ['A1', ['A3', 'B3', 'C#4', 'D#4', 'E4', 'F#4', 'G#4']],
        ['G#1', ['G#3', 'A#3', 'C4', 'D4', 'E4', 'F#4', 'G#4']],
    ];
    */
    private roots: [string, string[]][] = [
        [
            'D1',
            [
                'D3',
                'F3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'F3',
            ],
        ],
        [
            'F1',
            [
                'F3',
                'A3',
                'C3',
                'D3',
                'E3',
                'G3',
                'A3',
                'C3',
                'F3',
                'A3',
                'C3',
                'E3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
            ],
        ],
        [
            'Bb1',
            [
                'Bb3',
                'D3',
                'F3',
                'A3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'F3',
                'A3',
                'Bb3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'D3',
                'F3',
                'A3',
                'C3',
            ],
        ],
        [
            'A1',
            [
                'A3',
                'C3',
                'E3',
                'F3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'E3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'E3',
                'F3',
                'A3',
            ],
        ],
        [
            'C2',
            [
                'C3',
                'E3',
                'G3',
                'B3',
                'D3',
                'F3',
                'G3',
                'A3',
                'B3',
                'C3',
                'E3',
                'F3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'E3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'F3',
            ],
        ],
        [
            'G2',
            [
                'G3',
                'Bb3',
                'D3',
                'F3',
                'A3',
                'Bb3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'Bb3',
            ],
        ],
        [
            'E1',
            [
                'Eb3',
                'G3',
                'Bb3',
                'C3',
                'D3',
                'Eb3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'C3',
                'D3',
                'Eb3',
                'G3',
                'Bb3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'Bb3',
                'C3',
                'Eb3',
                'F3',
            ],
        ],
        [
            'D2',
            [
                'D3',
                'F3',
                'A3',
                'C3',
                'D3',
                'E3',
                'G3',
                'A3',
                'Bb3',
                'C3',
                'D3',
                'E3',
                'F3',
                'A3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
            ],
        ],
        [
            'F1',
            [
                'F3',
                'A3',
                'C3',
                'E3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'F3',
                'G3',
                'A3',
                'C3',
                'D3',
                'E3',
                'F3',
                'G3',
                'A3',
                'B3',
                'C3',
                'D3',
                'E3',
                'G3',
                'A3',
            ],
        ],
    ];

    constructor() {
        this.eventBus.register(ChainSynthEvent.VOLUME_CHANGED, (level: number) => {
            if (this.mainChannel) {
                this.mainChannel.volume.value = volumePercentageToDb(level);
            }
        });
        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (event: NewFinalizedBlockEvent) => {
                if (this.isStarted) {
                    this.processFinalizedBlock(event.block);
                }
            },
        );
        this.eventBus.register(
            ChainSynthEvent.BASS_PARAMETERS_UPDATED,
            (parameters: BassParameters) => {
                if (parameters.isOn) {
                    this.bassChannel.volume.value = volumePercentageToDb(
                        Constants.DEFAULT_VOLUME_PERCENTAGE,
                    );
                    this.bassReverbSendChannel.volume.value = volumePercentageToDb(
                        parameters.reverbLevel,
                    );
                } else {
                    this.bassChannel.volume.value = volumePercentageToDb(0);
                    this.bassReverbSendChannel.volume.value = volumePercentageToDb(0);
                }
                this.bassRootChannel.volume.value = volumePercentageToDb(parameters.rootLevel);
                this.bassOctaveChannel.volume.value = volumePercentageToDb(parameters.octaveLevel);
                this.bassFifthChannel.volume.value = volumePercentageToDb(parameters.fifthLevel);
                this.bassLowpassFilter.frequency.value = map(
                    parameters.filterCutoff,
                    0,
                    100,
                    60,
                    8000,
                );
            },
        );
        this.eventBus.register(
            ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
            (parameters: MelodyParameters) => {
                if (parameters.isOn) {
                    this.melodySynthChannel.volume.value = volumePercentageToDb(parameters.level);
                } else {
                    this.melodySynthChannel.volume.value = volumePercentageToDb(0);
                }
                this.melodySynth.envelope.decay = map(parameters.decay, 0, 100, 0.1, 100);
                this.melodySynthLowpassFilter.frequency.value = map(
                    parameters.filterCutoff,
                    0,
                    100,
                    60,
                    12000,
                );
                this.melodySynthDelaySendChannel.volume.value = volumePercentageToDb(
                    parameters.delaySend,
                );
            },
        );
        this.eventBus.register(ChainSynthEvent.SIGNAL, (signal: Signal) => {
            if (this.isStarted) {
                this.processSignal(signal);
            }
        });
    }

    async init(bassParams: BassParameters, melodyParams: MelodyParameters) {
        await Tone.start();
        Tone.getTransport().bpm.value = 60;
        this.mainChannel = new Tone.Channel({ channelCount: 2 });
        this.mainChannel.volume.value = volumePercentageToDb(Constants.DEFAULT_VOLUME_PERCENTAGE);
        this.mainChannel.toDestination();
        // send reverb
        this.sendReverb = new Tone.Freeverb({
            roomSize: 0.75, // Adjust the size of the reverb space (0 to 1)
            dampening: 1000, // High-frequency dampening, simulates material of the reverb space
            wet: 1.0,
        }).connect(this.mainChannel);
        // send delay
        this.sendDelay = new Tone.FeedbackDelay({
            delayTime: '8n', // Delay time in musical notation or seconds (e.g., "8n" for an eighth note)
            feedback: 0.65, // Feedback amount (0 to 1)
            wet: 1.0, // Mix amount (0 for dry, 1 for fully wet)
        }).toDestination();

        // bass
        this.bassChannel = new Tone.Channel({ channelCount: 2 });
        this.bassChannel.connect(this.mainChannel);
        this.bassChannel.volume.value = volumePercentageToDb(Constants.DEFAULT_VOLUME_PERCENTAGE);
        // bass root
        const root = this.roots[this.rootIndex][0];
        this.bassRootOsc = new Tone.Oscillator(root, 'sine');
        this.bassRootChannel = new Tone.Channel();
        this.bassRootChannel.volume.value = volumePercentageToDb(bassParams.rootLevel);
        this.bassRootChannel.connect(this.bassChannel);
        this.bassRootOsc.connect(this.bassRootChannel);
        // bass lowpass filter
        this.bassLowpassFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: map(bassParams.filterCutoff, 0, 100, 60, 8000),
            rolloff: -12, // Filter slope (-12, -24, -48, or -96 dB/octave)
            Q: 0,
        });
        this.bassLowpassFilter.connect(this.bassChannel);
        // bass octave
        this.bassOctaveOsc = new Tone.FatOscillator(Note.transpose(root, '8P'), 'sawtooth');
        this.bassOctaveChannel = new Tone.Channel();
        this.bassOctaveChannel.volume.value = volumePercentageToDb(bassParams.octaveLevel);
        this.bassOctaveChannel.pan.value = -0.25;
        this.bassOctaveChannel.connect(this.bassLowpassFilter);
        this.bassOctaveOsc.connect(this.bassOctaveChannel);
        // bass fifth
        this.bassFifthOsc = new Tone.FatOscillator(Note.transpose(root, '12P'), 'sawtooth');
        this.bassFifthChannel = new Tone.Channel();
        this.bassFifthChannel.volume.value = volumePercentageToDb(bassParams.fifthLevel);
        this.bassFifthChannel.pan.value = 0.35;
        this.bassFifthChannel.connect(this.bassLowpassFilter);
        this.bassFifthOsc.connect(this.bassFifthChannel);
        // bass reverb
        this.bassReverbSendChannel = new Tone.Channel();
        this.bassReverbSendChannel.connect(this.sendReverb);
        this.bassOctaveChannel.connect(this.bassReverbSendChannel);
        this.bassFifthChannel.connect(this.bassReverbSendChannel);
        this.bassReverbSendChannel.volume.value = volumePercentageToDb(bassParams.reverbLevel);

        // melody synth
        this.melodySynthChannel = new Tone.Channel({ channelCount: 2 });
        this.melodySynth = new Tone.Synth({
            envelope: {
                attack: 0, // time in seconds to reach maximum amplitude
                decay: map(melodyParams.decay, 0, 100, 0.1, 1000),
                sustain: 0.2, // sustain level (0 to 1)
                release: 1.0, // time in seconds for the note to fade after release
            },
            oscillator: {
                type: 'fatsawtooth',
            },
        });
        // melody lowpass filter
        this.melodySynthLowpassFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: map(melodyParams.filterCutoff, 0, 100, 60, 12000), // Cutoff frequency in Hz
            rolloff: -12, // Filter slope (-12, -24, -48, or -96 dB/octave)
            Q: 1,
        });
        this.melodySynthLowpassFilter.connect(this.melodySynthChannel);
        this.melodySynth.connect(this.melodySynthLowpassFilter);
        this.melodySynthChannel.volume.value = volumePercentageToDb(melodyParams.level);
        this.melodySynthChannel.connect(this.mainChannel);
        // melody delay send
        this.melodySynthDelaySendChannel = new Tone.Channel();
        this.melodySynthChannel.connect(this.melodySynthDelaySendChannel);
        this.melodySynthDelaySendChannel.connect(this.sendDelay);
        this.melodySynthDelaySendChannel.volume.value = volumePercentageToDb(
            melodyParams.delaySend,
        );
    }

    start() {
        this.isStarted = true;
        // bass
        this.bassRootOsc.start();
        this.bassOctaveOsc.start();
        this.bassFifthOsc.start();
    }

    processFinalizedBlock(block: BlockInfo) {
        this.rootIndex = Math.abs(block.hash.hash()) % this.roots.length;
        const root = this.roots[this.rootIndex][0];
        this.bassRootOsc.frequency.rampTo(root, Constants.BLOCK_TRANSITION_ANIM_DURATION_MS / 1000);
        this.bassOctaveOsc.frequency.rampTo(
            Note.transpose(root, '8P'),
            Constants.BLOCK_TRANSITION_ANIM_DURATION_MS / 1000,
        );
        this.bassFifthOsc.frequency.rampTo(
            Note.transpose(root, '12P'),
            Constants.BLOCK_TRANSITION_ANIM_DURATION_MS / 1000,
        );
    }

    processSignal(signal: Signal) {
        if (this.signal != signal) {
            return;
        }
        this.cycle++;
        const notes = this.roots[this.rootIndex][1];
        let note = notes[Math.floor(Math.random() * notes.length)];
        if (this.cycle % Math.floor(Math.random() * 17) == 0) {
            note = Note.transpose(note, '8P');
        }
        const now = Tone.now();
        this.melodySynth.triggerAttackRelease(note, '4n', now);
    }
}

export { Synth };
