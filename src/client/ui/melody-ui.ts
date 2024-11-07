import { MelodyParameters, Trigger } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    levelInput: HTMLInputElement;
    level: HTMLDivElement;
    decayInput: HTMLInputElement;
    decay: HTMLDivElement;
    filterCutoffInput: HTMLInputElement;
    filterCutoff: HTMLDivElement;
    delaySendInput: HTMLInputElement;
    delaySend: HTMLDivElement;
    x1Rate: HTMLDivElement;
    x2Rate: HTMLDivElement;
    x3Rate: HTMLDivElement;
    x4Rate: HTMLDivElement;
    x6Rate: HTMLDivElement;
    x8Rate: HTMLDivElement;
    x12Rate: HTMLDivElement;
    x16Rate: HTMLDivElement;
    x24Rate: HTMLDivElement;
    x32Rate: HTMLDivElement;
    x48Rate: HTMLDivElement;
    x64Rate: HTMLDivElement;
}

class MelodyUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: MelodyParameters = {
        isOn: true,
        level: 0,
        decay: 0,
        filterCutoff: 50,
        delaySend: 0,
        rate: Trigger.X4,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('melody-module'),
            toggleButton: <HTMLDivElement>document.getElementById('melody-toggle-button'),
            levelInput: <HTMLInputElement>document.getElementById('melody-level-input'),
            level: <HTMLInputElement>document.getElementById('melody-level'),
            decayInput: <HTMLInputElement>document.getElementById('melody-decay-input'),
            decay: <HTMLInputElement>document.getElementById('melody-decay'),
            filterCutoffInput: <HTMLInputElement>(
                document.getElementById('melody-filter-cutoff-input')
            ),
            filterCutoff: <HTMLInputElement>document.getElementById('melody-filter-cutoff'),
            delaySendInput: <HTMLInputElement>document.getElementById('melody-delay-send-input'),
            delaySend: <HTMLInputElement>document.getElementById('melody-delay-send'),
            x1Rate: <HTMLDivElement>document.getElementById('melody-rate-1x'),
            x2Rate: <HTMLDivElement>document.getElementById('melody-rate-2x'),
            x3Rate: <HTMLDivElement>document.getElementById('melody-rate-3x'),
            x4Rate: <HTMLDivElement>document.getElementById('melody-rate-4x'),
            x6Rate: <HTMLDivElement>document.getElementById('melody-rate-6x'),
            x8Rate: <HTMLDivElement>document.getElementById('melody-rate-8x'),
            x12Rate: <HTMLDivElement>document.getElementById('melody-rate-12x'),
            x16Rate: <HTMLDivElement>document.getElementById('melody-rate-16x'),
            x24Rate: <HTMLDivElement>document.getElementById('melody-rate-24x'),
            x32Rate: <HTMLDivElement>document.getElementById('melody-rate-32x'),
            x48Rate: <HTMLDivElement>document.getElementById('melody-rate-48x'),
            x64Rate: <HTMLDivElement>document.getElementById('melody-rate-64x'),
        };
        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.parameters.isOn = !this.parameters.isOn;
            if (this.parameters.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.levelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.levelInput.value);
            this.parameters.level = value;
            this.ui.level.innerHTML = `${value}%`;
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.decayInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.decayInput.value);
            this.parameters.decay = value;
            this.ui.decay.innerHTML = `${value}%`;
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.filterCutoffInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.filterCutoffInput.value);
            this.parameters.filterCutoff = value;
            this.ui.filterCutoff.innerHTML = `${value}%`;
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.delaySendInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.delaySendInput.value);
            this.parameters.delaySend = value;
            this.ui.delaySend.innerHTML = `${value}%`;
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x1Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X1;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x2Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X2;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x3Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X3;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x4Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X4;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x6Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X6;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x8Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X8;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x12Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X12;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x16Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X16;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x24Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X24;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x32Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X32;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x48Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X48;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x64Rate.addEventListener('click', (_event) => {
            this.parameters.rate = Trigger.X64;
            this.updateRate();
            this.eventBus.dispatch<MelodyParameters>(
                ChainSynthEvent.MELODY_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    private updateRate() {
        this.ui.x1Rate.classList.remove('on-bg');
        this.ui.x2Rate.classList.remove('on-bg');
        this.ui.x3Rate.classList.remove('on-bg');
        this.ui.x4Rate.classList.remove('on-bg');
        this.ui.x6Rate.classList.remove('on-bg');
        this.ui.x8Rate.classList.remove('on-bg');
        this.ui.x12Rate.classList.remove('on-bg');
        this.ui.x16Rate.classList.remove('on-bg');
        this.ui.x24Rate.classList.remove('on-bg');
        this.ui.x32Rate.classList.remove('on-bg');
        this.ui.x48Rate.classList.remove('on-bg');
        this.ui.x64Rate.classList.remove('on-bg');
        switch (this.parameters.rate) {
            case Trigger.X1:
                this.ui.x1Rate.classList.add('on-bg');
                break;
            case Trigger.X2:
                this.ui.x2Rate.classList.add('on-bg');
                break;
            case Trigger.X3:
                this.ui.x3Rate.classList.add('on-bg');
                break;
            case Trigger.X4:
                this.ui.x4Rate.classList.add('on-bg');
                break;
            case Trigger.X6:
                this.ui.x6Rate.classList.add('on-bg');
                break;
            case Trigger.X8:
                this.ui.x8Rate.classList.add('on-bg');
                break;
            case Trigger.X12:
                this.ui.x12Rate.classList.add('on-bg');
                break;
            case Trigger.X16:
                this.ui.x16Rate.classList.add('on-bg');
                break;
            case Trigger.X24:
                this.ui.x24Rate.classList.add('on-bg');
                break;
            case Trigger.X32:
                this.ui.x32Rate.classList.add('on-bg');
                break;
            case Trigger.X48:
                this.ui.x48Rate.classList.add('on-bg');
                break;
            case Trigger.X64:
                this.ui.x64Rate.classList.add('on-bg');
                break;
        }
    }

    show(initParams: MelodyParameters) {
        this.parameters = initParams;
        this.ui.levelInput.value = this.parameters.level.toString();
        this.ui.level.innerHTML = `${this.parameters.level}%`;
        this.ui.decayInput.value = this.parameters.decay.toString();
        this.ui.decay.innerHTML = `${this.parameters.decay}%`;
        this.ui.filterCutoffInput.value = this.parameters.filterCutoff.toString();
        this.ui.filterCutoff.innerHTML = `${this.parameters.filterCutoff}%`;
        this.ui.delaySendInput.value = this.parameters.delaySend.toString();
        this.ui.delaySend.innerHTML = `${this.parameters.delaySend}%`;
        this.updateRate();
        fadeElement(this.ui.root, true);
    }
}

export { MelodyUI };
