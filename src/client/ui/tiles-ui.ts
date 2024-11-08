import { MelodyParameters, NewFinalizedBlockEvent, Trigger, TriggerEvent } from '../data/types';
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
    opacityInput: HTMLInputElement;
    opacity: HTMLDivElement;
}

class TilesUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private isOn = true;
    private opacity = 0;
    private triggerRate = Trigger.X16;
    private readonly eventDenominator = 17;
    private lastIndex = -1;

    private color = { r: 255, g: 255, b: 255, a: 1 };

    constructor() {
        this.ui = {
            tiles: <HTMLDivElement>document.getElementById('tiles'),
            root: <HTMLDivElement>document.getElementById('tiles-module'),
            toggleButton: <HTMLDivElement>document.getElementById('tiles-toggle-button'),
            transactions: <HTMLDivElement>document.getElementById('tiles-transactions'),
            events: <HTMLDivElement>document.getElementById('tiles-events'),
            opacityInput: <HTMLInputElement>document.getElementById('tiles-opacity-input'),
            opacity: <HTMLDivElement>document.getElementById('tiles-opacity'),
        };
        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.isOn = !this.isOn;
            if (this.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
        });
        this.ui.opacityInput.addEventListener('input', (_event) => {
            const value = this.ui.opacityInput.value;
            this.opacity = Number(value).valueOf() / 100;
            this.ui.opacity.innerHTML = `${value}%`;
        });

        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (event: NewFinalizedBlockEvent) => {
                this.processFinalizedBlockEvent(event);
            },
        );
        this.eventBus.register(ChainSynthEvent.TRIGGER, (event: TriggerEvent) => {
            this.processTrigger(event);
        });
        this.eventBus.register(
            ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
            (parameters: MelodyParameters) => {
                this.triggerRate = parameters.rate;
            },
        );
    }

    private processFinalizedBlockEvent(event: NewFinalizedBlockEvent) {
        let html = '';
        for (let i = 0; i < event.extrinsicCount; i++) {
            html += '<div class="tile-row">';
            for (let j = 0; j < event.eventCount / this.eventDenominator; j++) {
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

    private processTrigger(event: TriggerEvent) {
        if (!this.isOn || event.trigger != this.triggerRate || event.random <= 0.1) {
            return;
        }
        const tiles = document.getElementsByClassName('tile');
        let randomIndex = Math.floor(Math.random() * tiles.length);
        while (randomIndex == this.lastIndex) {
            randomIndex = Math.floor(Math.random() * tiles.length);
        }
        const tile = tiles.item(randomIndex);
        randomIndex = Math.floor(Math.random() * tiles.length);
        const time = Constants.BLOCK_TIME_MS / event.trigger.valueOf();
        if (tile) {
            const tileDiv = tile as HTMLDivElement;
            tileDiv.style.opacity = this.opacity.toString();
            const color = { r: this.color.r, g: this.color.g, b: this.color.b, a: 1 };
            const targetColor = { r: this.color.r, g: this.color.g, b: this.color.b, a: 0 };
            const tween = createTween(
                color,
                targetColor,
                TWEEN.Easing.Exponential.InOut,
                time * 2.5,
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
