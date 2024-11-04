import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Constants } from '../util/constants';
import { createTween, fadeElement, startTween } from '../util/tween';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { EventBus } from '../event/event-bus';
import { ChainSynthEvent } from '../event/event';
import { BlockInfo } from '@polkadot-api/observable-client';
import * as TWEEN from '@tweenjs/tween.js';
import { NewFinalizedBlockEvent, ReactorParameters } from '../data/types';

const map = (value: number, x1: number, y1: number, x2: number, y2: number): number =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

class ChainSynthScene {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly controls: OrbitControls;
    private readonly renderer: THREE.WebGLRenderer;
    // private readonly stats: Stats;
    private composer: EffectComposer;
    private afterimagePass: AfterimagePass;

    private readonly raycaster: THREE.Raycaster;
    private readonly hoverPoint: THREE.Vector2 = new THREE.Vector2();

    private readonly eventBus = EventBus.getInstance();
    private isStarted = false;

    private reactorRadius = 27.5; // Sphere radius
    private readonly reactorWidthSegments = 32; // Width segments of the sphere
    private readonly reactorHeightSegments = 32; // Height segments of the sphere
    private readonly reactorGeometry = new THREE.SphereGeometry(
        this.reactorRadius,
        this.reactorWidthSegments,
        this.reactorHeightSegments,
    );
    private meshColor = 0x7efce0;
    private readonly reactorMaterial = new THREE.MeshPhongMaterial({
        color: this.meshColor,
        shininess: 130,
        flatShading: true,
        wireframe: true,
    });
    private reactor!: THREE.Mesh;
    private perturbationFactor = 0;
    private perturbationDamping = 0.5;

    private currentColor = { r: 126, g: 252, b: 224 };

    constructor(container: HTMLElement, reactorParams: ReactorParameters) {
        this.perturbationDamping = reactorParams.perturbation / 100;
        this.reactorRadius = map(reactorParams.radius, 0, 100, 15, 40);
        this.perturbationDamping = map(reactorParams.perturbation, 0, 100, 0, 1);
        window.addEventListener(
            'resize',
            () => {
                this.onWindowResize();
            },
            false,
        );
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.camera.position.set(0, 0, Constants.ORBIT_DEFAULT_DISTANCE);
        this.camera.lookAt(new THREE.Vector3());
        this.addLights();
        // raycaster
        this.raycaster = new THREE.Raycaster();
        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.id = 'scene-canvas';
        container.appendChild(this.renderer.domElement);
        document.addEventListener('click', (event) => {
            this.onClick(event);
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        this.limitOrbitControls();

        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.afterimagePass = new AfterimagePass();
        this.afterimagePass.uniforms['damp'].value = map(reactorParams.trace, 0, 100, 0, 1);
        this.composer.addPass(this.afterimagePass);

        this.eventBus.register(
            ChainSynthEvent.NEW_FINALIZED_BLOCK,
            (event: NewFinalizedBlockEvent) => {
                if (this.isStarted) {
                    this.processFinalizedBlock(event.block);
                }
            },
        );
        this.eventBus.register(
            ChainSynthEvent.REACTOR_PARAMETERS_UPDATED,
            (parameters: ReactorParameters) => {
                if (this.isStarted) {
                    this.reactorRadius = map(parameters.radius, 0, 100, 15, 40);
                    this.perturbationDamping = map(parameters.perturbation, 0, 100, 0, 1);
                    this.afterimagePass.uniforms['damp'].value = map(
                        parameters.trace,
                        0,
                        100,
                        0,
                        1,
                    );
                    this.updateGeometry(this.perturbationFactor);
                }
            },
        );
    }

    start(onComplete: () => void) {
        this.animate();
        this.addReactor();
        const canvas = document.getElementsByTagName('canvas')[0];
        fadeElement(canvas, true, () => {
            this.isStarted = true;
            onComplete();
        });
    }

    private processFinalizedBlock(block: BlockInfo) {
        const perturbationFactor = Math.abs(block.hash.hash()) % 50;
        const hash = parseInt(block.hash.slice(-16), 16);
        this.perturb(perturbationFactor);
        const color = {
            r: Math.floor(hash % 256),
            g: Math.floor((hash / 256) % 256),
            b: Math.floor((hash / 256 / 256) % 256),
            a: 1,
        };
        this.color(color);
    }

    private limitOrbitControls() {
        this.controls.minPolarAngle = Constants.ORBIT_MIN_POLAR_ANGLE;
        this.controls.maxPolarAngle = Constants.ORBIT_MAX_POLAR_ANGLE;
        this.controls.minAzimuthAngle = Constants.ORBIT_MIN_AZIMUTH_ANGLE;
        this.controls.maxAzimuthAngle = Constants.ORBIT_MAX_AZIMUTH_ANGLE;
        this.controls.minDistance = Constants.ORBIT_MIN_DISTANCE;
        this.controls.maxDistance = Constants.ORBIT_MAX_DISTANCE;
        this.controls.screenSpacePanning = true;
        const minPan = new THREE.Vector3(-Constants.ORBIT_MAX_PAN_X, -Constants.ORBIT_MAX_PAN_Y, 0);
        const maxPan = new THREE.Vector3(Constants.ORBIT_MAX_PAN_X, Constants.ORBIT_MAX_PAN_Y, 0);
        const _v = new THREE.Vector3();
        this.controls.addEventListener('change', () => {
            _v.copy(this.controls.target);
            this.controls.target.clamp(minPan, maxPan);
            _v.sub(this.controls.target);
            this.camera.position.sub(_v);
        });
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        this.controls.update();
        if (this.reactor) {
            this.reactor.rotation.y -= 0.01;
        }
        this.composer.render();
    }

    private addLights() {
        // point light front
        {
            const pointLight = new THREE.PointLight(0x404040);
            pointLight.intensity = Math.PI * 1.0 * 20;
            pointLight.position.x = 60;
            pointLight.position.y = 60;
            pointLight.position.z = 30;
            pointLight.decay = 0.15;
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        }
        // point light back
        {
            const pointLight = new THREE.PointLight(0x404040);
            pointLight.intensity = Math.PI * 1.0 * 20;
            pointLight.position.x = -20;
            pointLight.position.y = -40;
            pointLight.position.z = -30;
            pointLight.decay = 0.15;
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        }
        // ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, Math.PI * 1.0);
        this.scene.add(ambientLight);
    }

    private onClick(_event: MouseEvent) {}

    private perturb(target: number) {
        const perturbationFactor = { factor: this.perturbationFactor };

        const tween = createTween(
            perturbationFactor,
            { factor: target },
            TWEEN.Easing.Linear.InOut,
            1000,
            () => {},
            () => {
                this.updateGeometry(perturbationFactor.factor);
            },
            () => {
                this.perturbationFactor = target;
            },
        );
        startTween(tween);
    }

    private updateGeometry(perturbationFactor: number) {
        const reactorPositionAttribute = this.reactorGeometry.attributes.position;
        for (let i = 0; i < reactorPositionAttribute.count; i++) {
            // Get vertex position
            const x = reactorPositionAttribute.getX(i);
            const y = reactorPositionAttribute.getY(i);
            const z = reactorPositionAttribute.getZ(i);

            // Compute the normal and add noise along it
            const length = Math.sqrt(x * x + y * y + z * z);
            const perturbation =
                (Math.random() - 0.5) * 2 * perturbationFactor * this.perturbationDamping;
            const newX = (x / length) * (this.reactorRadius + perturbation);
            const newY = (y / length) * (this.reactorRadius + perturbation);
            const newZ = (z / length) * (this.reactorRadius + perturbation);

            // Set the perturbed position
            reactorPositionAttribute.setXYZ(i, newX, newY, newZ);
        }
        reactorPositionAttribute.needsUpdate = true;
    }

    private color(target: { r: number; g: number; b: number; a: number }) {
        const color = new THREE.Color().setRGB(
            this.currentColor.r / 255,
            this.currentColor.g / 255,
            this.currentColor.b / 255,
        );
        const endColor = new THREE.Color().setRGB(target.r / 255, target.g / 255, target.b / 255);
        const colorTween = createTween(
            color,
            endColor,
            TWEEN.Easing.Linear.InOut,
            1000,
            undefined,
            () => {
                this.reactorMaterial.color = color;
            },
            () => {
                this.currentColor = target;
            },
        );
        startTween(colorTween);
    }

    private addReactor() {
        this.reactor = new THREE.Mesh(this.reactorGeometry, this.reactorMaterial);
        this.reactor.rotation.z = 0.5;
        this.scene.add(this.reactor);
    }
}

export { ChainSynthScene };
