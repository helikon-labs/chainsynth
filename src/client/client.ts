import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import Two from "two.js";
import { Circle } from "two.js/src/shapes/circle";
import  * as Pizzicato from 'pizzicato';
import noteToFrequency from 'note-to-frequency';
import { truncate } from "./util";

const rpcEndpoint = "wss://rpc.helikon.io/polkadot";
const numberFormat = new Intl.NumberFormat('en-US');
const blockTimeMs = 6000;

declare global {
    interface String {
        hash(): number;
    }
}  

String.prototype.hash = function () {
    let d = String(this)
    var hash = 0, i, chr;
    if (d.length === 0) return hash;
    for (i = 0; i < d.length; i++) {
        chr = d.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

interface UI {
    canvasContainer: HTMLElement,
    startButton: HTMLElement;
    pageSpinner: HTMLElement;
    loadingStatus: HTMLElement;
    blockNumber: HTMLElement;
    blockProgress: HTMLElement;
    blockDetails: HTMLElement,
    extrinsicCount: HTMLElement;
    eventCount: HTMLElement;
    rootNote: HTMLElement,
}

class ChainSynth {
    private readonly ui: UI;
    private readonly two: Two;
    private readonly substrateClient: ApiPromise = new ApiPromise({
        provider: new WsProvider(rpcEndpoint),
    });
    private lastBlockTime = 0;
    private extrinsicCircles: Array<Circle> = [];
    private eventCircles: Array<Circle> = [];
    private extrinsicCount = 0;
    private eventCount = 0;
    private melodyIntervalMs = 1000;
    private melodyHasStarted = false;
    private melodyEventIndex = 0;

    private lastChord: Pizzicato.Group | null = null;
    private roots: [string, string, string[], string][] = [
        ['C2', 'G2', ['C3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'B3'], '#9A4E7A'],
        ['F2', 'C3', ['F3', 'G3', 'A3', 'A#3', 'C4', 'D4', 'E4'], '#AACC16'],
        ['D2', 'A2', ['D3', 'E3', 'F#3', 'G#3', 'A3', 'B3', 'C#4'], '#4EAA9F'],
        ['G2', 'D3', ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4'], '#326CFE'],
        ['A2', 'E3', ['A3', 'B3', 'C#4', 'D#4', 'E4', 'F#4', 'G#4'], '#95075B'],
        ['G#2', 'D#3', ['G#3', 'A#3', 'C4', 'D4', 'E4', 'F#4', 'G#4'], '#0685F0'],
    ];
    private root = this.roots[0];
    
    constructor() {
        this.ui = {
            canvasContainer: <HTMLElement>document.getElementById('canvas-container'),
            startButton: <HTMLElement>document.getElementById('start-button'),
            pageSpinner: <HTMLElement>document.getElementById('page-spinner'),
            loadingStatus: <HTMLElement>document.getElementById('loading-status'),
            blockNumber: <HTMLElement>document.getElementById('block-number'),
            blockProgress: <HTMLElement>document.getElementById('block-progress'),
            blockDetails: <HTMLElement>document.getElementById('block-details'),
            extrinsicCount: <HTMLElement>document.getElementById('extrinsic-count'),
            eventCount: <HTMLElement>document.getElementById('event-count'),
            rootNote: <HTMLElement>document.getElementById('root-note'),
        };
        this.two = new Two({
            fullscreen: true,
            autostart: true,
        }).appendTo(this.ui.canvasContainer);
    }

    async init() {
        this.ui.startButton.addEventListener("click", (_event) => {
            this.start();
        });
        window.addEventListener(
            "resize",
            () => {
                this.onWindowResize();
            },
            false
        );
    }

    private onWindowResize() {
        this.drawExtrinsics();
        this.drawEvents();
    }

    private async start() {
        // initialize pizzicato
        let context = Pizzicato.context;
        let source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start();

        this.ui.startButton.style.display = "none";
        this.ui.pageSpinner.style.display = "block";
        this.ui.loadingStatus.style.display = "block";
        await this.substrateClient.isReady;

        const finalizedBlockHash = await this.substrateClient.rpc.chain.getFinalizedHead();
        let finalizedHead = await this.substrateClient.rpc.chain.getHeader(finalizedBlockHash);

        this.ui.pageSpinner.style.display = "none";
        this.ui.loadingStatus.style.display = "none";
        this.processBlockDetails(finalizedHead);
        this.updateProgress();

        this.substrateClient.rpc.chain.subscribeFinalizedHeads((header) => {
            this.processBlockDetails(header);
            if (!this.melodyHasStarted) {
                this.melodyHasStarted = true;
                this.playMelody();
            }
        });
    }

    private async processBlockDetails(header: Header) {
        let rootIndex = Math.abs(header.hash.toString().hash()) % this.roots.length;
        this.root = this.roots[rootIndex];

        let block = await this.substrateClient.rpc.chain.getBlock(header.hash);
        this.ui.blockNumber.innerHTML = '<a href="https://polkadot.subscan.io/block/' + header.number.toString() + '" target="_blank">#' + numberFormat.format(header.number.toNumber()).replace(/,/g, "_") + '</a>';
        this.ui.blockDetails.innerHTML = truncate(header.hash.toString());
        this.ui.rootNote.innerHTML = this.root[0];
        this.ui.rootNote.style.color = this.root[3];
        this.extrinsicCount =  block.block.extrinsics.length;
        this.ui.extrinsicCount.innerHTML = this.extrinsicCount + " extrinsics"
        this.ui.extrinsicCount.style.color = this.root[3];
        this.ui.blockProgress.style.display = "flex";
        this.lastBlockTime = Date.now();
        this.melodyEventIndex = 0;

        if (this.lastChord) {
            this.lastChord.stop();
        }

        const root = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: noteToFrequency(this.root[0]),
                volume: 0.2,
                attack: 1.5,
                release: 0.5,
            }
        });
        const rootOctave = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: noteToFrequency(this.root[0]) * 2,
                volume: 0.1,
                attack: 1.5,
                release: 0.5,
            }
        });
        const fifth = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sawtooth',
                frequency: noteToFrequency(this.root[1]),
                volume: 0.2,
                attack: 2.0,
                release: 2.0,
            }
        });
        const lowPassFilter = new Pizzicato.Effects.LowPassFilter({
            frequency: 400,
            peak: 10
        });
        fifth.addEffect(lowPassFilter);
        this.lastChord = new Pizzicato.Group([root, rootOctave, fifth]);
        this.lastChord.play();

        const apiAt = await this.substrateClient.at(header.hash);
        const events = await apiAt.query.system.events();
        this.eventCount = (<Array<any>>events.toJSON()).length;
        this.melodyIntervalMs = blockTimeMs / this.eventCount;
        this.ui.eventCount.innerHTML = this.eventCount + " events";
        this.drawExtrinsics();
        this.drawEvents();
    }

    private playMelody() {
        const notes = this.root[2]; 
        const sound = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: noteToFrequency(notes[Math.floor(Math.random() * notes.length)]) * 2,
                volume: 0.1 + Math.random() * 0.1,
                attack: 0.001,
                release: 0.5 +  Math.random(),
            }
        });
        let reverbMix = 0.5;
        let reverbDecay = 0.75;
        if (this.extrinsicCount > 2 && this.extrinsicCount <= 6) {
            reverbMix = 0.6;
            reverbDecay = 1.0;
        } else if (this.extrinsicCount > 6 && this.extrinsicCount <= 10) {
            reverbMix = 0.75;
            reverbDecay = 1.25;
        } else if (this.extrinsicCount > 10) {
            reverbMix = 0.9;
            reverbDecay = 1.5;
        }
        const reverb = new Pizzicato.Effects.Reverb({
            time: 0.5,
            decay: reverbDecay,
            reverse: true,
            mix: reverbMix
        });
        const pan = new Pizzicato.Effects.StereoPanner({
            pan: (Math.random() * 2 - 1) / 1.5
        });
        sound.addEffect(reverb);
        sound.addEffect(pan);
        if (Math.random() > 0.75) {
            var pingPongDelay = new Pizzicato.Effects.PingPongDelay({
                feedback: 0.35,
                time: 0.1,
                mix: 0.75
            });
            sound.addEffect(pingPongDelay);
        }
        sound.play();
        this.melodyEventIndex++;
        const eventCircle = this.eventCircles[this.melodyEventIndex];
        if (eventCircle) {
            eventCircle.fill = "#FFF";
        }
        setTimeout(() => {
            sound.stop();
            this.playMelody();
        }, this.melodyIntervalMs);
    }

    private updateProgress() {
        const elapsed = Math.min(blockTimeMs, Date.now() - this.lastBlockTime);
        const progressPercent = Math.floor((elapsed * 100) / blockTimeMs);
        this.ui.blockProgress.style.background = "conic-gradient(#fff " + progressPercent + "%, 0, #000 " + (100 - progressPercent) + "%)";
        setTimeout(() => {
            this.updateProgress();
        }, 10);
    }

    private drawExtrinsicOuterCircle(): Circle {
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        const circle = this.two.makeCircle(centerX, centerY, 100);
        circle.fill = this.root[3];
        circle.stroke = this.root[3];
        circle.opacity = 0.35;
        circle.linewidth = 0.5;
        this.two.update();
        return circle;
    }

    private drawEventOuterCircle(): Circle {
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        const circle = this.two.makeCircle(centerX, centerY, 220);
        circle.noFill();
        circle.stroke = "#8E969D";
        circle.linewidth = 0.5;
        this.two.update();
        return circle;
    }

    private drawExtrinsics() {
        if (this.extrinsicCount == 0) {
            return;
        }
        const radius = 20;
        const distance = 100;
        this.extrinsicCircles.forEach((circle) => {
            this.two.remove(circle);
        });
        this.extrinsicCircles = [];
        this.extrinsicCircles.push(this.drawExtrinsicOuterCircle());
        const angle = Math.PI * 2 / this.extrinsicCount;
        const randomRotation = Math.random() * (Math.PI / 2);
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        for (var i = 0; i < this.extrinsicCount; i++) {
            var x = centerX + Math.cos(angle * i + randomRotation) * distance;
            var y = centerY + Math.sin(angle * i + randomRotation) * distance;
            const circle = this.two.makeCircle(x, y, radius);
            circle.fill = this.root[3];
            circle.linewidth = 0;
            this.extrinsicCircles.push(circle);
            this.two.update();
        }
    }

    private drawEvents() {
        if (this.eventCount == 0) {
            return;
        }
        let radius = (3200 - (16 * this.eventCount)) / 200;
        if (this.eventCount > 200) {
            radius = 1;
        }
        const distance = 220;
        this.eventCircles.forEach((circle) => {
            this.two.remove(circle);
        });
        this.eventCircles = [];
        this.eventCircles.push(this.drawEventOuterCircle());
        const angle = Math.PI * 2 / this.eventCount;
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        for (var i = 0; i < this.eventCount; i++) {
            var x = centerX + Math.cos(angle * i) * distance;
            var y = centerY + Math.sin(angle * i) * distance;
            const circle = this.two.makeCircle(x, y, radius);
            circle.fill = '#8E969D';
            circle.linewidth = 0;
            this.eventCircles.push(circle);
            this.two.update();
        }
    }
}

document.addEventListener("DOMContentLoaded", function (_) {
    new ChainSynth().init();
});
