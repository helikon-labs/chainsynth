import { BlockInfo } from '@polkadot-api/observable-client';
import { DataStore, DataStoreDelegate } from './data/data-store';
import { ChainSynthEvent } from './event/event';
import { EventBus } from './event/event-bus';
import { UI, UIDelegate } from './ui/ui';
import {
    Constants,
    getInitBassParams,
    getInitKickParams,
    getInitMelodyParams,
    getInitReactorParams,
    getInitSnareParams,
} from './util/constants';
import { Synth } from './audio/synth';
import { NewFinalizedBlockEvent, Trigger, TriggerEvent } from './data/types';

class ChainSynth {
    private readonly ui: UI;
    private readonly dataStore: DataStore;
    private readonly eventBus = EventBus.getInstance();
    private isStarted = false;
    private synth!: Synth;

    private readonly dataStoreDelegate = <DataStoreDelegate>{};
    private triggerTimeouts: NodeJS.Timeout[] = [];

    private readonly uiDelegate = <UIDelegate>{
        onTurnOn: async () => {
            this.turnOn();
        },
    };

    constructor() {
        this.dataStore = new DataStore(this.dataStoreDelegate);
        this.ui = new UI(this.uiDelegate, getInitReactorParams());

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
        await this.synth.init(getInitBassParams(), getInitMelodyParams());
        setTimeout(async () => {
            await this.dataStore.init();
            this.dataStore.subscribe();
        }, Constants.ARTIFICIAL_DELAY_MS);
    }

    private start() {
        this.isStarted = true;
        this.ui.setLoadingStatus(':: connection established ::');
        setTimeout(() => {
            this.ui.start(
                getInitReactorParams(),
                getInitBassParams(),
                getInitMelodyParams(),
                getInitKickParams(),
                getInitSnareParams(),
                () => {
                    this.synth.start();
                    this.startOscillator();
                },
            );
            this.isStarted = true;
        }, Constants.ARTIFICIAL_DELAY_MS);
    }

    private startOscillator() {
        this.trigger();
    }

    private trigger() {
        const triggers: Trigger[] = Object.values(Trigger) as Trigger[];
        this.triggerTimeouts.forEach((timeout, _index, _) => {
            clearTimeout(timeout);
        });
        this.triggerTimeouts = [];
        for (const trigger of triggers) {
            const random = Math.random();
            this.eventBus.dispatch<TriggerEvent>(ChainSynthEvent.TRIGGER, { trigger, random });
            for (let i = 1; i < trigger.valueOf(); i++) {
                const timeout = setTimeout(
                    () => {
                        const random = Math.random();
                        this.eventBus.dispatch<TriggerEvent>(ChainSynthEvent.TRIGGER, {
                            trigger,
                            random,
                        });
                    },
                    (Constants.BLOCK_TIME_MS / trigger.valueOf()) * i,
                );
                this.triggerTimeouts.push(timeout);
            }
        }
        setTimeout(() => {
            this.trigger();
        }, Constants.BLOCK_TIME_MS);
    }
}

export { ChainSynth };
