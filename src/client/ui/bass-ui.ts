import { BassParameters, Trigger } from '../data/types';
import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { fadeElement } from '../util/tween';

interface UI {
    root: HTMLDivElement;
    toggleButton: HTMLElement;
    levelInput: HTMLInputElement;
    level: HTMLDivElement;
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
    volumeModulationLevelInput: HTMLInputElement;
    volumeModulationLevel: HTMLDivElement;
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

class BassUI {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();

    private parameters: BassParameters = {
        isOn: true,
        level: 100,
        rootLevel: 75,
        octaveLevel: 18,
        fifthLevel: 10,
        filterCutoff: 10,
        reverbLevel: 40,
        volumeModulationLevel: 0,
        volumeModulationRate: Trigger.X4,
    };

    constructor() {
        this.ui = {
            root: <HTMLDivElement>document.getElementById('bass-module'),
            toggleButton: <HTMLDivElement>document.getElementById('bass-toggle-button'),
            levelInput: <HTMLInputElement>document.getElementById('bass-level-input'),
            level: <HTMLDivElement>document.getElementById('bass-level'),
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
            volumeModulationLevelInput: <HTMLInputElement>(
                document.getElementById('bass-volume-modulation-level-input')
            ),
            volumeModulationLevel: <HTMLDivElement>(
                document.getElementById('bass-volume-modulation-level')
            ),
            x1Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-1x'),
            x2Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-2x'),
            x3Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-3x'),
            x4Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-4x'),
            x6Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-6x'),
            x8Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-8x'),
            x12Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-12x'),
            x16Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-16x'),
            x24Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-24x'),
            x32Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-32x'),
            x48Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-48x'),
            x64Rate: <HTMLDivElement>document.getElementById('bass-volume-modulation-rate-64x'),
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
        this.ui.levelInput.addEventListener('input', (_event) => {
            const value = this.ui.levelInput.value;
            this.parameters.level = Number(value);
            this.ui.level.innerHTML = `${value}%`;
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
        this.ui.volumeModulationLevelInput.addEventListener('input', (_event) => {
            const value = Number(this.ui.volumeModulationLevelInput.value);
            this.parameters.volumeModulationLevel = value;
            this.ui.volumeModulationLevel.innerHTML = `${value}%`;
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x1Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X1;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x2Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X2;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x3Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X3;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x4Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X4;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x6Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X6;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x8Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X8;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x12Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X12;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x16Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X16;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x24Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X24;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x32Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X32;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x48Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X48;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
        this.ui.x64Rate.addEventListener('click', (_event) => {
            this.parameters.volumeModulationRate = Trigger.X64;
            this.updateRate();
            this.eventBus.dispatch<BassParameters>(
                ChainSynthEvent.BASS_PARAMETERS_UPDATED,
                this.parameters,
            );
        });
    }

    show(params: BassParameters) {
        this.parameters = params;
        // level
        this.ui.levelInput.value = this.parameters.level.toString();
        this.ui.level.innerHTML = `${this.parameters.level}%`;
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
        // volume modulation level
        this.ui.volumeModulationLevelInput.value = this.parameters.volumeModulationLevel.toString();
        this.ui.volumeModulationLevel.innerHTML = `${this.parameters.volumeModulationLevel}%`;
        this.updateRate();
        fadeElement(this.ui.root, true);
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
        switch (this.parameters.volumeModulationRate) {
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
}

export { BassUI };
