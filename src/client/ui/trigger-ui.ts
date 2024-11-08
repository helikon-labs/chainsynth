import { EventBus } from '../event/event-bus';
import { ChainSynthEvent } from '../event/event';
import { createTween, fadeElement, startTween } from '../util/tween';
import { Constants } from '../util/constants';
import { Trigger, TriggerEvent } from '../data/types';
import * as TWEEN from '@tweenjs/tween.js';

interface UI {
    root: HTMLDivElement;
    x1Signal: HTMLDivElement;
    x2Signal: HTMLDivElement;
    x3Signal: HTMLDivElement;
    x4Signal: HTMLDivElement;
    x6Signal: HTMLDivElement;
    x8Signal: HTMLDivElement;
    x12Signal: HTMLDivElement;
    x16Signal: HTMLDivElement;
    x24Signal: HTMLDivElement;
    x32Signal: HTMLDivElement;
    x48Signal: HTMLDivElement;
    x64Signal: HTMLDivElement;
}

class TriggerUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('trigger-module'),
            x1Signal: <HTMLDivElement>document.getElementById('trigger-module-1x-signal'),
            x2Signal: <HTMLDivElement>document.getElementById('trigger-module-2x-signal'),
            x3Signal: <HTMLDivElement>document.getElementById('trigger-module-3x-signal'),
            x4Signal: <HTMLDivElement>document.getElementById('trigger-module-4x-signal'),
            x6Signal: <HTMLDivElement>document.getElementById('trigger-module-6x-signal'),
            x8Signal: <HTMLDivElement>document.getElementById('trigger-module-8x-signal'),
            x12Signal: <HTMLDivElement>document.getElementById('trigger-module-12x-signal'),
            x16Signal: <HTMLDivElement>document.getElementById('trigger-module-16x-signal'),
            x24Signal: <HTMLDivElement>document.getElementById('trigger-module-24x-signal'),
            x32Signal: <HTMLDivElement>document.getElementById('trigger-module-32x-signal'),
            x48Signal: <HTMLDivElement>document.getElementById('trigger-module-48x-signal'),
            x64Signal: <HTMLDivElement>document.getElementById('trigger-module-64x-signal'),
        };
        this.eventBus.register(ChainSynthEvent.TRIGGER, (event: TriggerEvent) => {
            this.processTrigger(event);
        });
    }

    private processTrigger(event: TriggerEvent) {
        let element = this.ui.x1Signal;
        let time = Constants.BLOCK_TIME_MS;
        switch (event.trigger) {
            case Trigger.X1:
                element = this.ui.x1Signal;
                time /= 1;
                break;
            case Trigger.X2:
                element = this.ui.x2Signal;
                time /= 2;
                break;
            case Trigger.X3:
                element = this.ui.x3Signal;
                time /= 3;
                break;
            case Trigger.X4:
                element = this.ui.x4Signal;
                time /= 4;
                break;
            case Trigger.X6:
                element = this.ui.x6Signal;
                time /= 6;
                break;
            case Trigger.X8:
                element = this.ui.x8Signal;
                time /= 8;
                break;
            case Trigger.X12:
                element = this.ui.x12Signal;
                time /= 12;
                break;
            case Trigger.X16:
                element = this.ui.x16Signal;
                time /= 16;
                break;
            case Trigger.X24:
                element = this.ui.x24Signal;
                time /= 24;
                break;
            case Trigger.X32:
                element = this.ui.x32Signal;
                time /= 32;
                break;
            case Trigger.X48:
                element = this.ui.x48Signal;
                time /= 48;
                break;
            case Trigger.X64:
                element = this.ui.x64Signal;
                time /= 64;
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

export { TriggerUI };
