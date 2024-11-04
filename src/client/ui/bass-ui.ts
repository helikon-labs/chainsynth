import { BassParameters } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    rootLevelInput: HTMLInputElement;
    rootLevel: HTMLDivElement;
    octaveLevelInput: HTMLInputElement;
    octaveLevel: HTMLDivElement;
    fifthLevelInput: HTMLInputElement;
    fifthLevel: HTMLDivElement;
    filterCutoffInput: HTMLInputElement;
    filterCutoff: HTMLDivElement;
    reverbLevelInput: HTMLInputElement;
    reverbLevel: HTMLDivElement;
}

class BassUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: BassParameters = {
        isOn: true,
        rootLevel: 75,
        octaveLevel: 18,
        fifthLevel: 10,
        filterCutoff: 10,
        reverbLevel: 40,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('bass-module'),
            toggleButton: <HTMLDivElement>document.getElementById('bass-toggle-button'),
            rootLevelInput: <HTMLInputElement>document.getElementById('bass-root-level-input'),
            rootLevel: <HTMLDivElement>document.getElementById('bass-root-level'),
            octaveLevelInput: <HTMLInputElement>document.getElementById('bass-octave-level-input'),
            octaveLevel: <HTMLDivElement>document.getElementById('bass-octave-level'),
            fifthLevelInput: <HTMLInputElement>document.getElementById('bass-fifth-level-input'),
            fifthLevel: <HTMLDivElement>document.getElementById('bass-fifth-level'),
            filterCutoffInput: <HTMLInputElement>(
                document.getElementById('bass-filter-cutoff-input')
            ),
            filterCutoff: <HTMLDivElement>document.getElementById('bass-filter-cutoff'),
            reverbLevelInput: <HTMLInputElement>document.getElementById('bass-reverb-level-input'),
            reverbLevel: <HTMLDivElement>document.getElementById('bass-reverb-level'),
        };
        this.ui.toggleButton.addEventListener('click', (_event) => {
            this.parameters.isOn = !this.parameters.isOn;
            if (this.parameters.isOn) {
                this.ui.toggleButton.classList.add('on');
            } else {
                this.ui.toggleButton.classList.remove('on');
            }
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.rootLevelInput.addEventListener('input', (_event) => {
            const value = this.ui.rootLevelInput.value;
            this.parameters.rootLevel = Number(value);
            this.ui.rootLevel.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.octaveLevelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.octaveLevelInput.value);
            this.parameters.octaveLevel = value;
            this.ui.octaveLevel.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.fifthLevelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.fifthLevelInput.value);
            this.parameters.fifthLevel = value;
            this.ui.fifthLevel.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.filterCutoffInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.filterCutoffInput.value);
            this.parameters.filterCutoff = value;
            this.ui.filterCutoff.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.reverbLevelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.reverbLevelInput.value);
            this.parameters.reverbLevel = value;
            this.ui.reverbLevel.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    show(params: BassParameters) {
        this.parameters = params;
        // root
        this.ui.rootLevelInput.value = this.parameters.rootLevel.toString();
        this.ui.rootLevel.innerHTML = `${this.parameters.rootLevel}%`;
        // octave
        this.ui.octaveLevelInput.value = this.parameters.octaveLevel.toString();
        this.ui.octaveLevel.innerHTML = `${this.parameters.octaveLevel}%`;
        // fifth
        this.ui.fifthLevelInput.value = this.parameters.fifthLevel.toString();
        this.ui.fifthLevel.innerHTML = `${this.parameters.fifthLevel}%`;
        // filter cutoff
        this.ui.filterCutoffInput.value = this.parameters.filterCutoff.toString();
        this.ui.filterCutoff.innerHTML = `${this.parameters.filterCutoff}%`;
        // reverb
        this.ui.reverbLevelInput.value = this.parameters.reverbLevel.toString();
        this.ui.reverbLevel.innerHTML = `${this.parameters.reverbLevel}%`;
        fadeElement(this.ui.root, true);
    }
}

export { BassUI };
