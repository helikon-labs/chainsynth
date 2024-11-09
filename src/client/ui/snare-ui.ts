import { SnareParameters } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    levelInput: HTMLInputElement;
    level: HTMLDivElement;
}

class SnareUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: SnareParameters = {
        isOn: true,
        level: 0,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('snare-module'),
            toggleButton: <HTMLDivElement>document.getElementById('snare-toggle-button'),
            levelInput: <HTMLInputElement>document.getElementById('snare-level-input'),
            level: <HTMLInputElement>document.getElementById('snare-level'),
        };

        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.parameters.isOn = !this.parameters.isOn;
            if (this.parameters.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
            this.eventBus.dispatch<SnareParameters>(
                ChainSynthEvent.SNARE_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.levelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.levelInput.value);
            this.parameters.level = value;
            this.ui.level.innerHTML = `${value}%`;
            this.eventBus.dispatch<SnareParameters>(
                ChainSynthEvent.SNARE_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    show(initParams: SnareParameters) {
        this.parameters = initParams;
        this.ui.levelInput.value = this.parameters.level.toString();
        this.ui.level.innerHTML = `${this.parameters.level}%`;
        if (this.ui.root.classList.contains('no-display')) {
            fadeElement(this.ui.root, true);
        }
    }
}

export { SnareUI };
