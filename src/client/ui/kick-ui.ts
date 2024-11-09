import { KickParameters } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    levelInput: HTMLInputElement;
    level: HTMLDivElement;
    distortionInput: HTMLInputElement;
    distortion: HTMLDivElement;
}

class KickUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: KickParameters = {
        isOn: true,
        level: 0,
        distortion: 0,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('kick-module'),
            toggleButton: <HTMLDivElement>document.getElementById('kick-toggle-button'),
            levelInput: <HTMLInputElement>document.getElementById('kick-level-input'),
            level: <HTMLInputElement>document.getElementById('kick-level'),
            distortionInput: <HTMLInputElement>document.getElementById('kick-distortion-input'),
            distortion: <HTMLInputElement>document.getElementById('kick-distortion'),
        };

        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.parameters.isOn = !this.parameters.isOn;
            if (this.parameters.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
            this.eventBus.dispatch<KickParameters>(
                ChainSynthEvent.KICK_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.levelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.levelInput.value);
            this.parameters.level = value;
            this.ui.level.innerHTML = `${value}%`;
            this.eventBus.dispatch<KickParameters>(
                ChainSynthEvent.KICK_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.distortionInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.distortionInput.value);
            this.parameters.distortion = value;
            this.ui.distortion.innerHTML = `${value}%`;
            this.eventBus.dispatch<KickParameters>(
                ChainSynthEvent.KICK_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    show(initParams: KickParameters) {
        this.parameters = initParams;
        this.ui.levelInput.value = this.parameters.level.toString();
        this.ui.level.innerHTML = `${this.parameters.level}%`;
        this.ui.distortionInput.value = this.parameters.distortion.toString();
        this.ui.distortion.innerHTML = `${this.parameters.distortion}%`;
        if (this.ui.root.classList.contains('no-display')) {
            fadeElement(this.ui.root, true);
        }
    }
}

export { KickUI };
