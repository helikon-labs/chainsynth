import { BlockInfo } from '@polkadot-api/observable-client';
import { EventBus } from '../event/event-bus';
import { ChainSynthEvent } from '../event/event';
import { formatNumber, truncate } from '../util/format';
import { createTween, fadeElement, startTween } from '../util/tween';
import { Constants } from '../util/constants';
import { NewFinalizedBlockEvent, Signal } from '../data/types';
import * as TWEEN from '@tweenjs/tween.js';

interface UI {
    root: HTMLDivElement;
    bestBlock: HTMLDivElement;
    finalizedBlock: HTMLDivElement;
    progress: HTMLDivElement;
    hash: HTMLDivElement;
    transactions: HTMLDivElement;
    events: HTMLDivElement;
    x2Signal: HTMLDivElement;
    x4Signal: HTMLDivElement;
    x6Signal: HTMLDivElement;
    x12Signal: HTMLDivElement;
    x24Signal: HTMLDivElement;
}

class BlockUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();
    private lastBlockTime = 0;

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('block-module'),
            bestBlock: <HTMLDivElement>document.getElementById('block-module-best'),
            finalizedBlock: <HTMLDivElement>document.getElementById('block-module-finalized'),
            progress: <HTMLDivElement>document.getElementById('block-module-progress'),
            hash: <HTMLDivElement>document.getElementById('block-module-hash'),
            transactions: <HTMLDivElement>document.getElementById('block-module-transactions'),
            events: <HTMLDivElement>document.getElementById('block-module-events'),
            x2Signal: <HTMLDivElement>document.getElementById('block-module-2x-signal'),
            x4Signal: <HTMLDivElement>document.getElementById('block-module-4x-signal'),
            x6Signal: <HTMLDivElement>document.getElementById('block-module-6x-signal'),
            x12Signal: <HTMLDivElement>document.getElementById('block-module-12x-signal'),
            x24Signal: <HTMLDivElement>document.getElementById('block-module-24x-signal'),
        };
        this.ui.bestBlock.innerHTML = '';
        this.ui.finalizedBlock.innerHTML = '';
        this.ui.hash.innerHTML = '';
        this.ui.transactions.innerHTML = '';
        this.ui.events.innerHTML = '';
        this.eventBus.register(ChainSynthEvent.NEW_BEST_BLOCK, (block: BlockInfo) => {
            this.processBestBlock(block);
        });
        this.eventBus.register(ChainSynthEvent.SIGNAL, (x: Signal) => {
            this.processSignal(x);
        });
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
    }

    private updateBlockProgress() {
        const progress =
            ((new Date().getTime() - this.lastBlockTime) / Constants.BLOCK_TIME_MS) * 100;
        this.ui.progress.style.width = `${progress}%`;
        setTimeout(() => {
            this.updateBlockProgress();
        }, 10);
    }

    private processBestBlock(block: BlockInfo) {
        this.ui.bestBlock.innerHTML = formatNumber(BigInt(block.number).valueOf(), 0, 0);
    }

    private processFinalizedBlock(event: NewFinalizedBlockEvent) {
        this.ui.finalizedBlock.innerHTML = formatNumber(BigInt(event.block.number).valueOf(), 0, 0);
        this.ui.hash.innerHTML = truncate(event.block.hash, 11, '...', 5, 3);
        this.ui.transactions.innerHTML = event.extrinsicCount.toString();
        this.ui.events.innerHTML = event.eventCount.toString();
    }

    private processSignal(x: Signal) {
        let element = this.ui.x2Signal;
        let time = Constants.BLOCK_TIME_MS;
        switch (x) {
            case Signal.X2:
                element = this.ui.x2Signal;
                time /= 2;
                break;
            case Signal.X4:
                element = this.ui.x4Signal;
                time /= 4;
                break;
            case Signal.X6:
                element = this.ui.x6Signal;
                time /= 6;
                break;
            case Signal.X12:
                element = this.ui.x12Signal;
                time /= 12;
                break;
            case Signal.X24:
                element = this.ui.x24Signal;
                time /= 24;
                break;
        }
        const color = { r: 126, g: 252, b: 224, a: 1 };
        const targetColor = { r: 0, g: 0, b: 0, a: 0 };
        const tween = createTween(
            color,
            targetColor,
            TWEEN.Easing.Exponential.InOut,
            time,
            () => {
                element.style.backgroundColor = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(2)})`;
            },
            () => {
                element.style.backgroundColor = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(2)})`;
            },
        );
        startTween(tween);
    }

    show() {
        fadeElement(this.ui.root, true);
    }
}

export { BlockUI };
