import { MelodyParameters } from '../data/types';
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
        fadeElement(this.ui.root, true);
    }
}

export { MelodyUI };
