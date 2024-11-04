import { ReactorParameters } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    perturbationInput: HTMLInputElement;
    perturbation: HTMLDivElement;
    radiusInput: HTMLInputElement;
    radius: HTMLDivElement;
    traceInput: HTMLInputElement;
    trace: HTMLDivElement;
}

class ReactorUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: ReactorParameters = {
        isOn: true,
        perturbation: 50,
        radius: 50,
        trace: 50,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('reactor-module'),
            toggleButton: <HTMLDivElement>document.getElementById('reactor-toggle-button'),
            perturbationInput: <HTMLInputElement>(
                document.getElementById('reactor-perturbation-input')
            ),
            perturbation: <HTMLDivElement>document.getElementById('reactor-perturbation'),
            radiusInput: <HTMLInputElement>document.getElementById('reactor-radius-input'),
            radius: <HTMLDivElement>document.getElementById('reactor-radius'),
            traceInput: <HTMLInputElement>document.getElementById('reactor-trace-input'),
            trace: <HTMLDivElement>document.getElementById('reactor-trace'),
        };
        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.parameters.isOn = !this.parameters.isOn;
            if (this.parameters.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
            this.eventBus.dispatch<ReactorParameters>(
                ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.perturbationInput.addEventListener('input', (_event) => {
            const value = this.ui.perturbationInput.value;
            this.parameters.perturbation = Number(value);
            this.ui.perturbation.innerHTML = `${value}%`;
            this.eventBus.dispatch<ReactorParameters>(
                ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.radiusInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.radiusInput.value);
            this.parameters.radius = value;
            this.ui.radius.innerHTML = `${value}%`;
            this.eventBus.dispatch<ReactorParameters>(
                ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.traceInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.traceInput.value);
            this.parameters.trace = value;
            this.ui.trace.innerHTML = `${value}%`;
            this.eventBus.dispatch<ReactorParameters>(
                ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    show(initParams: ReactorParameters) {
        this.parameters = initParams;
        this.ui.perturbationInput.value = this.parameters.perturbation.toString();
        this.ui.perturbation.innerHTML = `${this.parameters.perturbation}%`;
        this.ui.radiusInput.value = this.parameters.radius.toString();
        this.ui.radius.innerHTML = `${this.parameters.radius}%`;
        this.ui.traceInput.value = this.parameters.trace.toString();
        this.ui.trace.innerHTML = `${this.parameters.trace}%`;

        fadeElement(this.ui.root, true);
    }
}

export { ReactorUI };
