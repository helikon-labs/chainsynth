import { ChainSynthEvent } from '../event/event';
import { EventBus } from '../event/event-bus';
import { ChainSynthScene } from '../scene/scene';
import { Constants } from '../util/constants';
import { fadeElement } from '../util/tween';
import { hide } from '../util/ui-util';
import { BassUI } from './bass-ui';
import { MelodyUI } from './melody-ui';
import { ReactorUI } from './reactor-ui';
import { VolumeControl } from './volume-control';
import { BassParameters, MelodyParameters, ReactorParameters } from '../data/types';
import { TriggerUI } from './trigger-ui';
import { TilesUI } from './tiles-ui';
import { MainBlockUI } from './main-block-ui';

interface UIDelegate {
    onTurnOn(): void;
}

class UI {
    private readonly root: HTMLElement;
    private readonly logoContainer: HTMLDivElement;
    private readonly sceneContainer: HTMLDivElement;
    private readonly content: HTMLDivElement;
    private readonly loading: HTMLDivElement;
    private readonly loadingStatus: HTMLSpanElement;
    private readonly turnOnButton: HTMLDivElement;

    private readonly scene: ChainSynthScene;
    private readonly volumeControl: VolumeControl;
    private readonly bass: BassUI;
    private readonly reactor: ReactorUI;
    private readonly melody: MelodyUI;
    private readonly trigger: TriggerUI;
    private readonly tiles: TilesUI;
    private readonly mainBlock: MainBlockUI;

    private delegate: UIDelegate;
    private readonly eventBus = EventBus.getInstance();

    constructor(delegate: UIDelegate, reactorParams: ReactorParameters) {
        this.delegate = delegate;
        this.root = <HTMLElement>document.getElementById('root');
        this.logoContainer = <HTMLDivElement>document.getElementById('logo-container');
        this.sceneContainer = <HTMLDivElement>document.getElementById('scene-container');
        this.content = <HTMLDivElement>document.getElementById('content');
        this.loading = <HTMLDivElement>document.getElementById('loading-container');
        this.loadingStatus = <HTMLSpanElement>document.getElementById('loading-status');
        this.turnOnButton = <HTMLDivElement>document.getElementById('turn-on-button');

        this.scene = new ChainSynthScene(this.sceneContainer, reactorParams);
        this.volumeControl = new VolumeControl();
        this.bass = new BassUI();
        this.reactor = new ReactorUI();
        this.melody = new MelodyUI();
        this.trigger = new TriggerUI();
        this.tiles = new TilesUI();
        this.mainBlock = new MainBlockUI();

        hide(this.content);
        hide(this.loading);
        hide(this.turnOnButton);
        this.volumeControl.hide();

        this.turnOnButton.addEventListener('click', async (_event) => {
            fadeElement(this.turnOnButton, false, () => {
                setTimeout(() => {
                    this.delegate.onTurnOn();
                }, Constants.CONTENT_FADE_ANIM_DURATION_MS);
            });
        });

        setTimeout(() => {
            fadeElement(this.logoContainer, true);
            fadeElement(this.turnOnButton, true);
        }, 1000);

        this.eventBus.register(
            ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
            (parameters: ReactorParameters) => {
                const canvasElement = document.getElementById('scene-canvas');
                if (canvasElement) {
                    if (parameters.isOn) {
                        canvasElement.style.opacity = '1.0';
                    } else {
                        canvasElement.style.opacity = '0.0';
                    }
                }
            },
        );
    }

    showLoading() {
        fadeElement(this.loading, true);
    }

    setLoadingStatus(status: string) {
        this.loadingStatus.innerHTML = status;
    }

    start(
        reactorParams: ReactorParameters,
        bassParams: BassParameters,
        melodyParams: MelodyParameters,
        onComplete: () => void,
    ) {
        fadeElement(this.loading, false, () => {
            setTimeout(() => {
                fadeElement(this.content, true, () => {
                    this.bass.show(bassParams);
                    this.reactor.show(reactorParams);
                    this.melody.show(melodyParams);
                    this.trigger.show();
                    this.tiles.show();
                    this.mainBlock.show();
                    this.scene.start(onComplete);
                });
                this.volumeControl.fadeIn();
            }, Constants.CONTENT_FADE_ANIM_DURATION_MS);
        });
    }
}

export { UI, UIDelegate };
