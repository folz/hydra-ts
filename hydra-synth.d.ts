import { Output } from './src/output';
import { Loop } from './src/loop';
import { HydraSource } from './src/hydra-source';
import { VideoRecorder } from './src/lib/video-recorder';
import { EvalSandbox } from './src/eval-sandbox';
import { DrawCommand, Regl } from 'regl';
import { GeneratorFactory } from './src/generator-factory';
declare const Mouse: any;
export declare type Precision = 'lowp' | 'mediump' | 'highp';
export interface Synth {
    time: number;
    bpm: number;
    width: number;
    height: number;
    fps?: number;
    stats: {
        fps: number;
    };
    speed: number;
    mouse: typeof Mouse;
    render: any;
    setResolution: any;
    update?: (dt: number) => void;
    hush: any;
    screencap?: () => void;
    vidRecorder?: VideoRecorder;
    [name: string]: any;
}
interface HydraRendererOptions {
    pb?: HydraRenderer['pb'];
    width?: HydraRenderer['width'];
    height?: HydraRenderer['height'];
    numSources?: number;
    numOutputs?: number;
    makeGlobal?: boolean;
    autoLoop?: boolean;
    detectAudio?: HydraRenderer['detectAudio'];
    enableStreamCapture?: boolean;
    regl: HydraRenderer['regl'];
    precision?: HydraRenderer['precision'];
}
export declare class HydraRenderer implements HydraRendererOptions {
    pb?: any | null;
    width: number;
    height: number;
    detectAudio?: boolean;
    synth: Synth;
    timeSinceLastUpdate: number;
    _time: number;
    precision: Precision;
    saveFrame: boolean;
    captureStream: MediaStream | null;
    generator?: GeneratorFactory;
    sandbox: EvalSandbox;
    imageCallback?: (blob: Blob | null) => void;
    regl: Regl;
    renderAll: DrawCommand | false;
    renderFbo: DrawCommand;
    isRenderingAll: boolean;
    s: HydraSource[];
    o: Output[];
    output: Output;
    loop: Loop;
    [name: string]: any;
    constructor({ pb, width, height, numSources, numOutputs, makeGlobal, autoLoop, detectAudio, enableStreamCapture, precision, regl, }: HydraRendererOptions);
    hush: () => void;
    setResolution: (width: number, height: number) => void;
    canvasToImage(): void;
    _initRegl(): void;
    _initOutputs(numOutputs: number): void;
    _initSources(numSources: number): void;
    createSource(i: number): HydraSource;
    _generateGlslTransforms(): void;
    _render: (output: Output) => void;
    tick: (dt: number) => void;
}
export {};
