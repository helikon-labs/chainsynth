import * as Tone from 'tone';
import { Constants } from '../util/constants';
import { EventBus } from '../event/event-bus';
import { ChainSynthEvent } from '../event/event';
import { BlockInfo } from '@polkadot-api/observable-client';
import { Note } from 'tonal';
import { volumePercentageToDb } from '../util/audio-util';
import {
    BassParameters,
    MelodyParameters,
    NewFinalizedBlockEvent,
    Trigger,
    TriggerEvent,
} from '../data/types';

const map = (value: number, x1: number, y1: number, x2: number, y2: number): number =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

const ROOTS: [string, string, string[]][] = [
    ['G1', 'G min', ['G3', 'Bb3', 'D4', 'F4', 'A4']],
    ['F1', 'F maj', ['F3', 'A3', 'C4', 'G4', 'A4']],
    ['C1', 'C min', ['C3', 'Eb3', 'G3', 'Bb4']],
    ['Eb1', 'Eb maj', ['Eb3', 'G3', 'Bb3', 'D4', 'F4']],
];

class Synth {
    private readonly eventBus = EventBus.getInstance();
    private isStarted = false;
    private mainChannel!: Tone.Channel;
    private sendReverb!: Tone.Freeverb;
    private sendDelay!: Tone.FeedbackDelay;

    // block
    private kickSteps = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ];
    private snareSteps = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ];

    private bassParameters!: BassParameters;
    private bassChannel!: Tone.Channel;
    private bassGain!: Tone.Gain;
    // bass root
    private bassRootOsc!: Tone.Oscillator;
    // bass octave
    private bassOctaveOsc!: Tone.FatOscillator;
    private bassOctaveChannel!: Tone.Channel;
    // bass fifth
    private bassFifthOsc!: Tone.FatOscillator;
    private bassFifthChannel!: Tone.Channel;
    // bass LP filter
    private bassLowpassFilter!: Tone.Filter;
    // bass send channels
    private bassReverbSendHighpassFilter!: Tone.Filter;
    private bassReverbSendChannel!: Tone.Channel;
    // bass volume modulation
    private bassVolumeModulationTrigger: Trigger | undefined = Trigger.X4;

    // melody
    private melodyParameters!: MelodyParameters;
    private melodySynth!: Tone.Synth;
    private melodySynthChannel!: Tone.Channel;
    // melody LP filter
    private melodySynthLowpassFilter!: Tone.Filter;
    // melody send
    private melodySynthDelaySendChannel!: Tone.Channel;

    // kick
    private beatStep = 0;
    private kick!: Tone.MembraneSynth;
    private kickChannel!: Tone.Channel;
    private snare!: Tone.NoiseSynth;
    private snareChannel!: Tone.Channel;

    private rootIndex: number = 0;
    private cycle = 0;

    constructor() {
        this.eventBus.register(ChainSynthEvent.VOLUME_CHANGED, (level: number) => {
            if (this.mainChannel) {
                this.mainChannel.volume.linearRampTo(
                    volumePercentageToDb(level),
                    Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
                );
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
                this.updateBassParameters(parameters);
            },
        );
        this.eventBus.register(
            ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
            (parameters: MelodyParameters) => {
                this.updateMelodyParameters(parameters);
            },
        );
        this.eventBus.register(ChainSynthEvent.TRIGGER, (event: TriggerEvent) => {
            if (this.isStarted) {
                this.processTrigger(event);
            }
        });
    }

    async init(bassParams: BassParameters, melodyParams: MelodyParameters) {
        await Tone.start();
        Tone.getTransport().bpm.value = 60;
        this.mainChannel = new Tone.Channel({ channelCount: 2 });
        this.mainChannel.volume.rampTo(
            volumePercentageToDb(Constants.DEFAULT_VOLUME_PERCENTAGE),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.mainChannel.toDestination();
        // send reverb
        this.sendReverb = new Tone.Freeverb({
            roomSize: 0.75, // Adjust the size of the reverb space (0 to 1)
            dampening: 1000, // High-frequency dampening, simulates material of the reverb space
            wet: 1.0,
        }).connect(this.mainChannel);
        // send delay
        this.sendDelay = new Tone.FeedbackDelay({
            delayTime: '4t',
            feedback: 0.65,
            wet: 1.0, // Mix amount (0 for dry, 1 for fully wet)
        }).toDestination();

        // bass
        this.bassChannel = new Tone.Channel({ channelCount: 2 });
        this.bassChannel.connect(this.mainChannel);
        this.bassGain = new Tone.Gain(1.0);
        this.bassGain.connect(this.bassChannel);
        this.bassChannel.volume.value = 0;
        // bass lowpass filter
        this.bassLowpassFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 0,
            rolloff: -12,
            Q: 0,
            gain: 1.0,
        });
        this.bassLowpassFilter.connect(this.bassGain);
        // bass root
        const root = ROOTS[this.rootIndex][0];
        this.bassRootOsc = new Tone.Oscillator(root, 'sine');
        this.bassRootOsc.volume.value = 0;
        this.bassRootOsc.connect(this.bassLowpassFilter);
        // bass octave
        this.bassOctaveOsc = new Tone.FatOscillator(Note.transpose(root, '8P'), 'sawtooth');
        this.bassOctaveChannel = new Tone.Channel();
        this.bassOctaveChannel.volume.value = 0;
        this.bassOctaveChannel.pan.linearRampTo(-0.25, Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC);
        this.bassOctaveChannel.connect(this.bassLowpassFilter);
        this.bassOctaveOsc.connect(this.bassOctaveChannel);
        // bass fifth
        this.bassFifthOsc = new Tone.FatOscillator(Note.transpose(root, '12P'), 'sawtooth');
        this.bassFifthChannel = new Tone.Channel();
        this.bassFifthChannel.volume.value = 0;
        this.bassFifthChannel.pan.linearRampTo(0.35, Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC);
        this.bassFifthChannel.connect(this.bassLowpassFilter);
        this.bassFifthOsc.connect(this.bassFifthChannel);
        // bass reverb
        this.bassReverbSendHighpassFilter = new Tone.Filter({
            type: 'highpass',
            frequency: 1000,
            rolloff: -12,
            Q: 0,
            gain: 1.0,
        });
        this.bassReverbSendChannel = new Tone.Channel();
        this.bassReverbSendChannel.connect(this.sendReverb);
        this.bassChannel.connect(this.bassReverbSendHighpassFilter);
        this.bassReverbSendHighpassFilter.connect(this.bassReverbSendChannel);
        this.bassReverbSendChannel.volume.value = 0;
        this.updateBassParameters(bassParams);

        // melody synth
        this.melodySynthChannel = new Tone.Channel({ channelCount: 2 });
        this.melodySynthChannel.connect(this.mainChannel);
        this.melodySynthChannel.volume.value = 0;
        this.melodySynth = new Tone.Synth({
            envelope: {
                attack: 0,
                decay: 0,
                sustain: 0.1,
                release: 1.0,
            },
            oscillator: {
                type: 'fatsawtooth',
            },
        });
        this.melodySynthLowpassFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 0,
            rolloff: -12,
            Q: 1,
        });
        this.melodySynth.connect(this.melodySynthLowpassFilter);
        this.melodySynthLowpassFilter.connect(this.melodySynthChannel);

        // melody delay send
        this.melodySynthDelaySendChannel = new Tone.Channel();
        this.melodySynthChannel.connect(this.melodySynthDelaySendChannel);
        this.melodySynthDelaySendChannel.connect(this.sendDelay);
        this.melodySynthDelaySendChannel.volume.value = 0;
        this.updateMelodyParameters(melodyParams);

        // kick
        this.kickChannel = new Tone.Channel();
        this.kickChannel.connect(this.mainChannel);
        this.kickChannel.volume.value = volumePercentageToDb(0);
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.25, sustain: 0 },
        });
        this.kick.connect(this.kickChannel);
        // snare
        this.snareChannel = new Tone.Channel();
        this.snareChannel.connect(this.mainChannel);
        this.snareChannel.volume.value = volumePercentageToDb(0);
        this.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
        });
        this.snare.connect(this.snareChannel);
    }

    start() {
        this.isStarted = true;
        // bass
        this.bassRootOsc.start();
        this.bassOctaveOsc.start();
        this.bassFifthOsc.start();
    }

    private updateBassParameters(parameters: BassParameters) {
        if (parameters.isOn) {
            this.bassChannel.volume.linearRampTo(
                volumePercentageToDb(parameters.level),
                Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
            );
        } else {
            this.bassChannel.volume.linearRampTo(
                volumePercentageToDb(0),
                Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
            );
        }
        this.bassRootOsc.volume.linearRampTo(
            volumePercentageToDb(parameters.rootLevel),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.bassOctaveChannel.volume.linearRampTo(
            volumePercentageToDb(parameters.octaveLevel),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.bassFifthChannel.volume.linearRampTo(
            volumePercentageToDb(parameters.fifthLevel),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.bassLowpassFilter.frequency.linearRampTo(
            map(parameters.filterCutoff, 0, 100, 60, 8000),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.bassReverbSendChannel.volume.linearRampTo(
            volumePercentageToDb(parameters.reverbLevel),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.bassParameters = parameters;
    }

    private updateMelodyParameters(parameters: MelodyParameters) {
        if (parameters.isOn) {
            this.melodySynthChannel.volume.linearRampTo(
                volumePercentageToDb(parameters.level),
                Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
            );
        } else {
            this.melodySynthChannel.volume.linearRampTo(
                volumePercentageToDb(0),
                Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
            );
        }
        this.melodySynth.portamento = map(parameters.portamento, 0, 100, 0, 0.1);
        this.melodySynth.envelope.decay = map(parameters.decay, 0, 100, 0.1, 1);
        this.melodySynthLowpassFilter.frequency.linearRampTo(
            map(parameters.filterCutoff, 0, 100, 60, 12000),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.melodySynthDelaySendChannel.volume.linearRampTo(
            volumePercentageToDb(parameters.delaySend),
            Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
        );
        this.melodyParameters = parameters;
    }

    private processFinalizedBlock(block: BlockInfo) {
        const bits = parseInt(block.hash.slice(-8), 16).toString(2).padStart(32, '0');
        for (let i = 15; i >= 0; i--) {
            this.kickSteps[i] = bits.charAt(i) == '1';
        }
        for (let i = 31; i >= 16; i--) {
            this.snareSteps[i - 16] = bits.charAt(i) == '1';
        }
        this.rootIndex = Math.abs(block.hash.hash()) % ROOTS.length;
        const root = ROOTS[this.rootIndex][0];
        this.bassRootOsc.frequency.linearRampTo(root, Constants.CHORD_TRANSITION_TIME_MS / 1000);
        this.bassOctaveOsc.frequency.linearRampTo(
            Note.transpose(root, '8P'),
            Constants.CHORD_TRANSITION_TIME_MS / 1000,
        );
        this.bassFifthOsc.frequency.linearRampTo(
            Note.transpose(root, '12P'),
            Constants.CHORD_TRANSITION_TIME_MS / 1000,
        );
    }

    processTrigger(event: TriggerEvent) {
        if (event.trigger == this.melodyParameters.rate && event.random > 0.1) {
            this.cycle++;
            const notes = ROOTS[this.rootIndex][2];
            let note = notes[Math.floor(Math.random() * notes.length)];
            if (this.cycle % Math.floor(Math.random() * 17) == 0) {
                note = Note.transpose(note, '8P');
            }
            const now = Tone.now();
            this.melodySynth.triggerAttackRelease(note, '8n', now);
        }
        if (event.trigger == this.bassParameters.volumeModulationRate) {
            this.bassGain.gain.linearRampTo(1.0, Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC);
            const filterDiff =
                (this.bassParameters.filterCutoff / 5) *
                (1 - this.bassParameters.volumeModulationLevel / 100);
            this.bassLowpassFilter.frequency.linearRampTo(
                map(this.bassParameters.filterCutoff + filterDiff, 0, 100, 60, 8000),
                Constants.PARAMETERS_CHANGE_RAMP_TIME_SEC,
            );
            setTimeout(() => {
                this.bassGain.gain.linearRampTo(
                    1.0 - this.bassParameters.volumeModulationLevel / 100,
                    (Constants.BLOCK_TIME_MS / event.trigger.valueOf() / 1000 / 8) * 7,
                );
                this.bassLowpassFilter.frequency.linearRampTo(
                    map(this.bassParameters.filterCutoff, 0, 100, 60, 8000),
                    0.5,
                );
            }, 10);
        }
        if (event.trigger == Trigger.X4) {
            this.beatStep = 0;
        }
        let velocity = 0.5;
        if (this.beatStep % 4 == 0) {
            velocity = 1.0;
        }
        if (event.trigger == Trigger.X64) {
            if (this.kickSteps[this.beatStep]) {
                this.kick.triggerAttackRelease('C1', '16n', Tone.now(), velocity);
            }
            if (this.snareSteps[this.beatStep]) {
                this.snare.triggerAttackRelease('16n', Tone.now(), velocity);
            }
            this.beatStep++;
        }
    }
}

export { Synth, ROOTS };
