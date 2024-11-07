import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { BassParameters, MelodyParameters, ReactorParameters } from '../data/types';

export abstract class Constants {
    // RPC
    static readonly KUSAMA_RPC_URL = 'wss://rpc.ibp.network/kusama';
    //static readonly POLKADOT_RPC_URL = 'wss://rpc.ibp.network/polkadot';
    static readonly POLKADOT_RPC_URL = 'wss://rpc.helikon.io/polkadot';
    //static readonly POLKADOT_RPC_URL = 'wss://polkadot.rpc.subquery.network';
    // blockchain
    static readonly BLOCK_TIME_MS = 6000;
    // orbit control
    static readonly ORBIT_MIN_POLAR_ANGLE = Math.PI / 12;
    static readonly ORBIT_MAX_POLAR_ANGLE = (Math.PI * 11) / 12;
    static readonly ORBIT_MIN_AZIMUTH_ANGLE = (-5 * Math.PI) / 12;
    static readonly ORBIT_MAX_AZIMUTH_ANGLE = (5 * Math.PI) / 12;
    static readonly ORBIT_DEFAULT_DISTANCE = 340;
    static readonly ORBIT_MIN_DISTANCE = 50;
    static readonly ORBIT_MAX_DISTANCE = 600;
    static readonly ORBIT_MAX_PAN_X = 50;
    static readonly ORBIT_MAX_PAN_Y = 50;
    // connection
    static readonly CONNECTION_TIMEOUT_MS = 30000;
    static readonly CONNECTION_RETRY_MS = 5000;
    // UI
    static readonly HASH_TRIM_SIZE = 7;
    static readonly CONTENT_FADE_ANIM_DURATION_MS = 300;
    static readonly ARTIFICIAL_DELAY_MS = 0;
    // audio
    static readonly DEFAULT_VOLUME_PERCENTAGE = 70;
    static readonly VOLUME_CHANGE_STEP = 10;
    static readonly CHORD_TRANSITION_TIME_MS = 500;
    // format
    static readonly BALANCE_FORMAT_DECIMALS = 4;
    static readonly DECIMAL_SEPARATOR = '.';
    static readonly THOUSANDS_SEPARATOR = ',';
    static readonly MAX_IDENTITY_DISPLAY_LENGTH = 24;
    // camera
    static readonly CAMERA_START_POSITION = new THREE.Vector3(
        180,
        180,
        Constants.ORBIT_DEFAULT_DISTANCE / 2,
    );
    static readonly CAMERA_RESET_ANIM_LENGTH_MS = 1000;
    static readonly CAMERA_RESET_ANIM_CURVE = TWEEN.Easing.Cubic.Out;
}

export abstract class Kusama {
    static readonly DECIMAL_COUNT = 12;
}

export abstract class Polkadot {
    static readonly DECIMAL_COUNT = 10;
}

export const INIT_BASS_PARAMS: BassParameters = {
    isOn: true,
    rootLevel: 25,
    octaveLevel: 18,
    fifthLevel: 10,
    filterCutoff: 10,
    reverbLevel: 40,
};

export const INIT_REACTOR_PARAMS: ReactorParameters = {
    isOn: true,
    perturbation: 50,
    radius: 50,
    trace: 50,
};

export const INIT_MELODY_PARAMS: MelodyParameters = {
    isOn: true,
    level: 0,
    decay: 20,
    filterCutoff: 5,
    delaySend: 0,
};
