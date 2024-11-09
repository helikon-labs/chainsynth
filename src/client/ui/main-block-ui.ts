import { ROOTS } from '../audio/synth';
import { NewFinalizedBlockEvent, Trigger, TriggerEvent } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { formatNumber, truncate } from '../util/format';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    progress: HTMLDivElement;
    number: HTMLDivElement;
    hash: HTMLDivElement;
    rootNote: HTMLDivElement;
    chord: HTMLDivElement;
    hashBitContainers: HTMLDivElement[];
    hashBits: HTMLDivElement[];
}

class MainBlockUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();
    private lastBlockTime = 0;
    private beatStep = 0;

    constructor() {
        const hashBits: HTMLDivElement[] = [];
        const hashBitContainers: HTMLDivElement[] = [];
        for (let i = 0; i < 32; i++) {
            const hashBitContainer = <HTMLDivElement>(
                document.getElementById(`main-block-module-hash-bit-container-${i}`)
            );
            hashBitContainers.push(hashBitContainer);
            const hashBit = <HTMLDivElement>(
                document.getElementById(`main-block-module-hash-bit-${i}`)
            );
            hashBits.push(hashBit);
        }
        this.ui = {
            root: <HTMLDivElement>document.getElementById('main-block-module'),
            progress: <HTMLDivElement>document.getElementById('main-block-module-progress'),
            number: <HTMLDivElement>document.getElementById('main-block-module-number'),
            hash: <HTMLDivElement>document.getElementById('main-block-module-hash'),
            rootNote: <HTMLDivElement>document.getElementById('main-block-module-root-note'),
            chord: <HTMLDivElement>document.getElementById('main-block-module-chord'),
            hashBitContainers,
            hashBits,
        };

        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (event: NewFinalizedBlockEvent) => {
                if (this.lastBlockTime == 0) {
                    this.updateBlockProgress();
                }
                this.lastBlockTime = new Date().getTime();
                this.processFinalizedBlock(event);
            },
        );

        this.eventBus.register(ChainSynthEvent.TRIGGER, (event: TriggerEvent) => {
            this.processTrigger(event);
        });
    }

    private updateBlockProgress() {
        const progress =
            ((new Date().getTime() - this.lastBlockTime) / Constants.BLOCK_TIME_MS) * 100;
        this.ui.progress.style.width = `${progress}%`;
        setTimeout(() => {
            this.updateBlockProgress();
        }, 10);
    }

    private processFinalizedBlock(event: NewFinalizedBlockEvent) {
        const rootIndex = Math.abs(event.block.hash.hash()) % ROOTS.length;
        const rootNote = ROOTS[rootIndex][0];
        this.ui.number.innerHTML = formatNumber(BigInt(event.block.number).valueOf(), 0, 0);
        this.ui.hash.innerHTML = truncate(event.block.hash, 11, '...', 7, 5);
        this.ui.rootNote.innerHTML = `HASH % ${ROOTS.length} = ${rootNote}`;
        this.ui.chord.innerHTML = ROOTS[rootIndex][1];
        const bits = parseInt(event.block.hash.slice(-8), 16).toString(2).padStart(32, '0');
        for (let i = 0; i < bits.length; i++) {
            const element = this.ui.hashBits[i];
            element.classList.remove('on-bg');
            if (bits.charAt(i) == '1') {
                element.classList.add('on-bg');
            }
        }
    }

    show() {
        fadeElement(this.ui.root, true);
    }

    private processTrigger(event: TriggerEvent) {
        if (event.trigger == Trigger.X4) {
            this.beatStep = 0;
        }
        if (event.trigger == Trigger.X64) {
            for (const container of this.ui.hashBitContainers) {
                container.classList.remove('current-step');
            }
            this.ui.hashBitContainers[this.beatStep].classList.add('current-step');
            this.ui.hashBitContainers[this.beatStep + 16].classList.add('current-step');
            this.beatStep++;
        }
    }
}

export { MainBlockUI };
