import { NewFinalizedBlockEvent, Signal } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { createTween, fadeElement, startTween } from '../util/tween';
import * as TWEEN from '@tweenjs/tween.js';

interface UI {
    tiles: HTMLDivElement;
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    transactions: HTMLDivElement;
    events: HTMLDivElement;
}

class TilesUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private isOn = false;
    private signal = Signal.X12;

    private color = { r: 255, g: 255, b: 255, a: 1 };

    constructor() {
        this.ui = {
            tiles: <HTMLDivElement>document.getElementById('tiles'),
            root: <HTMLDivElement>document.getElementById('tiles-module'),
            toggleButton: <HTMLDivElement>document.getElementById('tiles-toggle-button'),
            transactions: <HTMLDivElement>document.getElementById('tiles-transactions'),
            events: <HTMLDivElement>document.getElementById('tiles-events'),
        };
        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.isOn = !this.isOn;
            if (this.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
        });

        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (event: NewFinalizedBlockEvent) => {
                this.processFinalizedBlockEvent(event);
            },
        );
        this.eventBus.register(ChainSynthEvent.SIGNAL, (signal: Signal) => {
            this.processSignal(signal);
        });
    }

    private processFinalizedBlockEvent(event: NewFinalizedBlockEvent) {
        let html = '';
        for (let i = 0; i < event.extrinsicCount; i++) {
            html += '<div class="tile-row">';
            for (let j = 0; j < event.eventCount; j++) {
                if (j % 3 == 0) {
                    html += '<div class="tile"></div>';
                } else {
                    html += '<div class="tile"></div>';
                }
            }
            html += '</div>';
        }
        this.ui.tiles.innerHTML = html;
        this.ui.transactions.innerHTML = event.extrinsicCount.toString();
        this.ui.events.innerHTML = event.eventCount.toString();
        const hash = parseInt(event.block.hash.slice(-16), 16);
        this.color.r = Math.floor((hash / 256 / 256) % 256);
        this.color.g = Math.floor(hash % 256);
        this.color.b = Math.floor((hash / 256) % 256);
    }

    private processSignal(signal: Signal) {
        if (!this.isOn || this.signal != signal) {
            return;
        }
        const tiles = document.getElementsByClassName('tile');
        const randomIndex = Math.floor(Math.random() * tiles.length);
        const tile = tiles.item(randomIndex);
        let time = Constants.BLOCK_TIME_MS;
        switch (signal) {
            case Signal.X2:
                time /= 2;
                break;
            case Signal.X4:
                time /= 4;
                break;
            case Signal.X6:
                time /= 6;
                break;
            case Signal.X12:
                time /= 12;
                break;
            case Signal.X24:
                time /= 24;
                break;
        }
        if (tile) {
            (tile as HTMLDivElement).style.backgroundColor = 'white';
            const color = { r: this.color.r, g: this.color.g, b: this.color.b, a: 1 };
            const targetColor = { r: 0, g: 0, b: 0, a: 0 };
            const tween = createTween(
                color,
                targetColor,
                TWEEN.Easing.Exponential.InOut,
                time * 2,
                () => {
                    (tile as HTMLDivElement).style.backgroundColor =
                        `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(2)})`;
                },
                () => {
                    (tile as HTMLDivElement).style.backgroundColor =
                        `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(2)})`;
                },
            );
            startTween(tween);
        }
    }

    show() {
        fadeElement(this.ui.root, true);
    }
}

export { TilesUI };
