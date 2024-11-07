import { BlockInfo } from '@polkadot-api/observable-client';

enum Trigger {
    X1 = 1,
    X2 = 2,
    X3 = 3,
    X4 = 4,
    X6 = 6,
    X8 = 8,
    X12 = 12,
    X16 = 16,
    X24 = 24,
    X32 = 32,
    X48 = 48,
    X64 = 64,
}

interface BassParameters {
    isOn: boolean;
    level: number;
    rootLevel: number;
    octaveLevel: number;
    fifthLevel: number;
    filterCutoff: number;
    reverbLevel: number;
    volumeModulationLevel: number;
    volumeModulationRate: Trigger;
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
    rate: Trigger;
}

interface NewFinalizedBlockEvent {
    block: BlockInfo;
    extrinsicCount: number;
    eventCount: number;
}

export { BassParameters, ReactorParameters, MelodyParameters, NewFinalizedBlockEvent, Trigger };
