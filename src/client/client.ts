import { ChainSynth } from './chainsynth';

declare global {
    interface String {
        hash(): number;
    }
}

String.prototype.hash = function () {
    const d = String(this);
    let hash = 0,
        i,
        chr;
    if (d.length === 0) return hash;
    for (i = 0; i < d.length; i++) {
        chr = d.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

document.addEventListener('DOMContentLoaded', function (_) {
    new ChainSynth();
});
