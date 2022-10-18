import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import * as Tone from 'tone'
import Two from "two.js";
import { Circle } from "two.js/src/shapes/circle";

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

interface UI {
    canvasContainer: HTMLElement,
    startButton: HTMLElement;
    pageSpinner: HTMLElement;
    loadingStatus: HTMLElement;
    blockNumber: HTMLElement;
    blockProgress: HTMLElement;
    extrinsicCount: HTMLElement;
    eventCount: HTMLElement;
}

class ChainSynth {
    private readonly ui: UI;
    private readonly two: Two;
    private readonly substrateClient: ApiPromise = new ApiPromise({
        provider: new WsProvider(rpcEndpoint),
    });
    private readonly synth: Tone.PolySynth;
    private lastBlockTime = 0;
    private extrinsicCircles: Array<Circle> = [];
    private eventCircles: Array<Circle> = [];
    private extrinsicCount = 0;
    private eventCount = 0;

    private rootNotes = ["C3", "F3", "D3", "G3", "A3"];
    
    constructor() {
        this.ui = {
            canvasContainer: <HTMLElement>document.getElementById("canvas-container"),
            startButton: <HTMLElement>document.getElementById("start-button"),
            pageSpinner: <HTMLElement>document.getElementById("page-spinner"),
            loadingStatus: <HTMLElement>document.getElementById("loading-status"),
            blockNumber: <HTMLElement>document.getElementById("block-number"),
            blockProgress: <HTMLElement>document.getElementById("block-progress"),
            extrinsicCount: <HTMLElement>document.getElementById("extrinsic-count"),
            eventCount: <HTMLElement>document.getElementById("event-count"),
        };
        this.two = new Two({
            fullscreen: true,
            autostart: true,
        }).appendTo(this.ui.canvasContainer);
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
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
        });
    }

    private async processBlockDetails(header: Header) {
        let block = await this.substrateClient.rpc.chain.getBlock(header.hash);
        this.ui.blockNumber.innerHTML = "Block " + numberFormat.format(header.number.toNumber()).replace(/,/g, "_");
        this.extrinsicCount =  block.block.extrinsics.length;
        this.ui.extrinsicCount.innerHTML = this.extrinsicCount + " extrinsics"
        this.ui.blockProgress.style.display = "block";
        this.ui.blockProgress.style.background = "conic-gradient(#fff 20%, black 20%)";
        this.lastBlockTime = Date.now();

        let rootIndex = header.hash.toString().hash() % this.rootNotes.length;
        let rootNote = this.rootNotes[rootIndex];
        
        const now = Tone.now();
        this.synth.releaseAll();
        this.synth.triggerAttack(rootNote, now);
        this.synth.triggerRelease([rootNote], now + (blockTimeMs / 1000));

        const apiAt = await this.substrateClient.at(header.hash);
        const events = await apiAt.query.system.events();
        this.eventCount = (<Array<any>>events.toJSON()).length;
        this.ui.eventCount.innerHTML = this.eventCount + " events";
        this.drawExtrinsics();
        this.drawEvents();
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
        circle.stroke = "#9A4E7A";
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
        this.extrinsicCircles.push(this.drawExtrinsicOuterCircle());
        const angle = Math.PI * 2 / this.extrinsicCount;
        const randomRotation = Math.random() * (Math.PI / 2);
        const centerX = this.two.width * 0.5;
        const centerY = this.two.height * 0.5;
        for (var i = 0; i < this.extrinsicCount; i++) {
            var x = centerX + Math.cos(angle * i + randomRotation) * distance;
            var y = centerY + Math.sin(angle * i + randomRotation) * distance;
            const circle = this.two.makeCircle(x, y, radius);
            circle.fill = '#9A4E7A';
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
            this.extrinsicCircles.push(circle);
            this.two.update();
        }
    }
}

document.addEventListener("DOMContentLoaded", function (_) {
    new ChainSynth().init();
});