import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import Two from "two.js";
import { Circle } from "two.js/src/shapes/circle";
import  * as Pizzicato from 'pizzicato';

const rpcEndpoint = "wss://polkadot.public.curie.radiumblock.io/ws";
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

function truncate(
    fullStr: string,
    strLen = 10,
    separator = "...",
    frontChars = 10,
    backChars = 8,
  ) {
    if (fullStr.length <= strLen) return fullStr;
  
    return (
      fullStr.substring(0, frontChars) +
      separator +
      fullStr.substring(fullStr.length - backChars)
    );
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
    private rootNotes: [string, number, number, number[], string][] = [
        ["C2", 65.41, 98.0, [130.81, 146.83, 164.81, 185.00, 196.00, 220.00, 246.94], "#9A4E7A"],
        ["F2", 87.31, 130.815, [174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 329.63], "#AACC16"],
        ["D2", 73.42, 110.0, [146.83, 164.81, 185.00, 207.65, 220.00, 246.94, 277.18], "#4EAA9F"],
        ["G2", 98.0, 146.83, [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23], "#326CFE"],
        ["A2", 110.0, 164.815, [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], "#95075B"],
        ["G#1", 51.91, 155.56, [207.65, 233.08, 261.63, 293.66, 329.63, 369.99], "#0685F0"],
    ];
    private rootNote = this.rootNotes[0];
    
    constructor() {
        this.ui = {
            canvasContainer: <HTMLElement>document.getElementById("canvas-container"),
            startButton: <HTMLElement>document.getElementById("start-button"),
            pageSpinner: <HTMLElement>document.getElementById("page-spinner"),
            loadingStatus: <HTMLElement>document.getElementById("loading-status"),
            blockNumber: <HTMLElement>document.getElementById("block-number"),
            blockProgress: <HTMLElement>document.getElementById("block-progress"),
            blockDetails: <HTMLElement>document.getElementById("block-details"),
            extrinsicCount: <HTMLElement>document.getElementById("extrinsic-count"),
            eventCount: <HTMLElement>document.getElementById("event-count"),
            rootNote: <HTMLElement>document.getElementById("root-note"),
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
        let rootIndex = Math.abs(header.hash.toString().hash()) % this.rootNotes.length;
        this.rootNote = this.rootNotes[rootIndex];

        let block = await this.substrateClient.rpc.chain.getBlock(header.hash);
        this.ui.blockNumber.innerHTML = "Block " + numberFormat.format(header.number.toNumber()).replace(/,/g, "_");
        this.ui.blockDetails.innerHTML = truncate(header.hash.toString());
        this.ui.rootNote.innerHTML = this.rootNote[0];
        this.ui.rootNote.style.color = this.rootNote[4];
        this.extrinsicCount =  block.block.extrinsics.length;
        this.ui.extrinsicCount.innerHTML = this.extrinsicCount + " extrinsics"
        this.ui.extrinsicCount.style.color = this.rootNote[4];
        this.ui.blockProgress.style.display = "block";
        this.ui.blockProgress.style.background = "conic-gradient(#fff 20%, black 20%)";
        this.lastBlockTime = Date.now();
        this.melodyEventIndex = 0;

        if (this.lastChord) {
            this.lastChord.stop();
        }

        const root = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: this.rootNote[1],
                volume: 0.2,
                attack: 1.5,
                release: 1.5,
            }
        });
        const distortion = new Pizzicato.Effects.Distortion({
            gain: 0.2
        });
        root.addEffect(distortion);
        const fifth = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: this.rootNote[2],
                volume: 0.2,
                attack: 1.0,
                release: 1.5,
            }
        });
        this.lastChord = new Pizzicato.Group([root, fifth]);
        // this.lastSound.addEffect(this.reverb);
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
        const notes = this.rootNote[3]; 
        const sound = new Pizzicato.Sound({ 
            source: 'wave', 
            options: {
                type: 'sine',
                frequency: notes[Math.floor(Math.random() * notes.length)] * 2,
                volume: 0.1 + Math.random() * 0.1,
                attack: 0.001,
                release: 0.5 +  Math.random(),
            }
        });
        const reverb = new Pizzicato.Effects.Reverb({
            time: 0.5,
            decay: 0.75,
            reverse: true,
            mix: 0.5
        });
        const pan = new Pizzicato.Effects.StereoPanner({
            pan: (Math.random() * 2 - 1) / 1.5
        });
        sound.addEffect(reverb);
        sound.addEffect(pan);
        if (Math.random() > 0.75) {
            var pingPongDelay = new Pizzicato.Effects.PingPongDelay({
                feedback: 0.3,
                time: 0.2,
                mix: 0.68
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
        const progressPercent = (elapsed * 100) / blockTimeMs;
        this.ui.blockProgress.style.background = "conic-gradient(#fff " + progressPercent + "%, black " + progressPercent + "%)";
        setTimeout(() => {
            this.updateProgress();
        }, 1);
    }

    private drawExtrinsicOuterCircle(): Circle {
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        const circle = this.two.makeCircle(centerX, centerY, 100);
        circle.noFill();
        circle.stroke = this.rootNote[4];
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
            circle.fill = this.rootNote[4];
            circle.linewidth = 0;
            this.extrinsicCircles.push(circle);
            this.two.update();
        }
    }

    private drawEvents() {
        if (this.eventCount == 0) {
            return;
        }
        const radius = 12;
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
