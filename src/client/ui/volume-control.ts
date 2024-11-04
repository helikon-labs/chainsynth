import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { Constants } from '../util/constants';
import { fadeElement } from '../util/tween';
import { hide } from '../util/ui-util';

interface UI {
    container: HTMLDivElement;
    volumeUp: HTMLDivElement;
    volumeDown: HTMLDivElement;
    level: HTMLDivElement;
}

class VolumeControl {
    private readonly ui: UI;
    private readonly eventBus = EventBus.getInstance();
    private levelPercentage = Constants.DEFAULT_VOLUME_PERCENTAGE;

    constructor() {
        this.ui = {
            container: <HTMLDivElement>document.getElementById('volume-control-container'),
            volumeUp: <HTMLDivElement>document.getElementById('volume-up'),
            volumeDown: <HTMLDivElement>document.getElementById('volume-down'),
            level: <HTMLDivElement>document.getElementById('volume-level'),
        };
        this.updateLevel();
        this.ui.volumeUp.addEventListener('click', async (_event) => {
            this.levelPercentage = Math.min(
                100,
                this.levelPercentage + Constants.VOLUME_CHANGE_STEP,
            );
            this.updateLevel();
            this.eventBus.dispatch<number>(ChainSynthEvent.VOLUME_CHANGED, this.levelPercentage);
        });
        this.ui.volumeDown.addEventListener('click', async (_event) => {
            this.levelPercentage = Math.max(0, this.levelPercentage - Constants.VOLUME_CHANGE_STEP);
            this.updateLevel();
            this.eventBus.dispatch<number>(ChainSynthEvent.VOLUME_CHANGED, this.levelPercentage);
        });
    }

    private updateLevel() {
        this.ui.level.style.width = this.levelPercentage + '%';
    }

    hide() {
        hide(this.ui.container);
    }

    fadeIn() {
        fadeElement(this.ui.container, true);
    }
}

export { VolumeControl };
