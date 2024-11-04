import * as TWEEN from '@tweenjs/tween.js';
import { hide, show } from './ui-util';
import { Constants } from './constants';

declare type EasingFunction = (amount: number) => number;

export function createTween<T, U>(
    property: T,
    targetProperties: U,
    curve: EasingFunction,
    durationMs: number,
    onStart?: () => void,
    onUpdate?: () => void,
    onComplete?: () => void,
    /* eslint-disable @typescript-eslint/no-explicit-any */
): TWEEN.Tween<any> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return new TWEEN.Tween(property as any)
        .to(targetProperties as any, durationMs)
        .easing(curve)
        .onStart(() => {
            if (onStart) {
                onStart();
            }
        })
        .onUpdate((_object, _elapsed) => {
            if (onUpdate) {
                onUpdate();
            }
        })
        .onComplete(() => {
            if (onComplete) {
                onComplete();
            }
        });
}

export function startTween(tween: TWEEN.Tween<any>) {
    const group = new TWEEN.Group(tween);
    tween.start();
    animate(performance.now());
    function animate(time: number) {
        group.update(time);
        if (!group.allStopped()) {
            requestAnimationFrame(animate);
        }
    }
}

export function fadeElement(
    element: HTMLElement,
    fadeIn: boolean,
    onComplete: (() => void) | undefined = undefined,
) {
    const initial = fadeIn ? 0 : 100;
    const target = 100 - initial;
    element.style.opacity = `${initial}%`;
    show(element);
    const opacity = { opacity: initial };
    const tween = createTween(
        opacity,
        { opacity: target },
        TWEEN.Easing.Linear.InOut,
        Constants.CONTENT_FADE_ANIM_DURATION_MS,
        () => {
            element.style.opacity = `${initial}%`;
        },
        () => {
            element.style.opacity = `${opacity.opacity}%`;
        },
        () => {
            if (!fadeIn) {
                hide(element);
            }
            if (onComplete) {
                onComplete();
            }
        },
    );
    startTween(tween);
}
