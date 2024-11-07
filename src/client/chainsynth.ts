import { BlockInfo } from '@polkadot-api/observable-client';
import { DataStore, DataStoreDelegate } from './data/data-store';
import { ChainSynthEvent } from './event/event';
import { EventBus } from './event/event-bus';
import { UI, UIDelegate } from './ui/ui';
import {
    Constants,
    INIT_BASS_PARAMS,
    INIT_MELODY_PARAMS,
    INIT_REACTOR_PARAMS,
} from './util/constants';
import { Synth } from './audio/synth';
import { NewFinalizedBlockEvent, Trigger } from './data/types';

class ChainSynth {
    private readonly ui: UI;
    private readonly dataStore: DataStore;
    private readonly eventBus = EventBus.getInstance();
    private isStarted = false;
    private synth!: Synth;

    private readonly dataStoreDelegate = <DataStoreDelegate>{};

    private readonly uiDelegate = <UIDelegate>{
        onTurnOn: async () => {
            this.turnOn();
        },
    };

    constructor() {
        this.dataStore = new DataStore(this.dataStoreDelegate);
        this.ui = new UI(this.uiDelegate, INIT_REACTOR_PARAMS);

        this.eventBus.register(ChainSynthEvent.NEW_BEST_BLOCK, (_block: BlockInfo) => {});
        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (_event: NewFinalizedBlockEvent) => {
                if (!this.isStarted) {
                    this.start();
                }
            },
        );
    }

    private async turnOn() {
        this.ui.showLoading();
        this.ui.setLoadingStatus(':: connecting to blockchain ::');
        this.synth = new Synth();
        await this.synth.init(INIT_BASS_PARAMS, INIT_MELODY_PARAMS);
        setTimeout(async () => {
            await this.dataStore.init();
            this.dataStore.subscribe();
        }, Constants.ARTIFICIAL_DELAY_MS);
    }

    private start() {
        this.isStarted = true;
        this.ui.setLoadingStatus(':: connection established ::');
        setTimeout(() => {
            this.ui.start(INIT_REACTOR_PARAMS, INIT_BASS_PARAMS, INIT_MELODY_PARAMS, () => {
                this.synth.start();
                this.startOscillator();
            });
            this.isStarted = true;
        }, Constants.ARTIFICIAL_DELAY_MS);
    }

    private startOscillator() {
        this.trigger(1);
        this.trigger(2);
        this.trigger(4);
        this.trigger(6);
        this.trigger(12);
        this.trigger(24);
        this.trigger(36);
        this.trigger(48);
    }

    private trigger(trigger: Trigger) {
        this.eventBus.dispatch<Trigger>(ChainSynthEvent.TRIGGER, trigger);
        let timeout = Constants.BLOCK_TIME_MS;
        switch (trigger) {
            case Trigger.X1:
                timeout /= 1;
                break;
            case Trigger.X2:
                timeout /= 2;
                break;
            case Trigger.X4:
                timeout /= 4;
                break;
            case Trigger.X6:
                timeout /= 6;
                break;
            case Trigger.X12:
                timeout /= 12;
                break;
            case Trigger.X24:
                timeout /= 24;
                break;
            case Trigger.X36:
                timeout /= 36;
                break;
            case Trigger.X48:
                timeout /= 48;
                break;
        }
        setTimeout(() => {
            this.trigger(trigger);
        }, timeout);
    }
}

export { ChainSynth };
