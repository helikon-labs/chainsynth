import { BlockInfo } from '@polkadot-api/observable-client';

enum Trigger {
    X1 = 1,
    X2 = 2,
    X4 = 4,
    X6 = 6,
    X12 = 12,
    X24 = 24,
    X36 = 36,
    X48 = 48,
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

export { BassParameters, ReactorParameters, MelodyParameters, NewFinalizedBlockEvent, Trigger };
