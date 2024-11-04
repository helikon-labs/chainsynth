import { BlockInfo } from '@polkadot-api/observable-client';

enum Signal {
    X2 = 2,
    X4 = 4,
    X6 = 6,
    X12 = 12,
    X24 = 24,
}

interface BassParameters {
    isOn: boolean;
    rootLevel: number;
    octaveLevel: number;
    fifthLevel: number;
    filterCutoff: number;
    reverbLevel: number;
}

interface ReactorParameters {
    isOn: boolean;
    perturbation: number;
    radius: number;
    trace: number;
}

interface MelodyParameters {
    isOn: boolean;
    level: number;
    decay: number;
    filterCutoff: number;
    delaySend: number;
}

interface NewFinalizedBlockEvent {
    block: BlockInfo;
    extrinsicCount: number;
    eventCount: number;
}

export { BassParameters, ReactorParameters, MelodyParameters, NewFinalizedBlockEvent, Signal };
