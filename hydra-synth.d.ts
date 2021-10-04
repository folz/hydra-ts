import { Output } from './src/output';
import { Loop } from './src/loop';
import { HydraSource } from './src/hydra-source';
import { EvalSandbox } from './src/eval-sandbox';
import { DrawCommand, Regl } from 'regl';
import { GeneratorFactory } from './src/generator-factory';
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
    render: any;
    setResolution: any;
    update?: (dt: number) => void;
    hush: () => void;
    [name: string]: any;
}
interface HydraRendererOptions {
    width?: HydraRenderer['width'];
    height?: HydraRenderer['height'];
    numSources?: number;
    numOutputs?: number;
    makeGlobal?: boolean;
    autoLoop?: boolean;
    detectAudio?: HydraRenderer['detectAudio'];
    regl: HydraRenderer['regl'];
    precision?: HydraRenderer['precision'];
}
export declare class HydraRenderer implements HydraRendererOptions {
    width: number;
    height: number;
    detectAudio?: boolean;
    synth: Synth;
    timeSinceLastUpdate: number;
    _time: number;
    precision: Precision;
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
    constructor({ width, height, numSources, numOutputs, makeGlobal, autoLoop, detectAudio, precision, regl, }: HydraRendererOptions);
    hush: () => void;
    setResolution: (width: number, height: number) => void;
    _initRegl(): void;
    _initOutputs(numOutputs: number): void;
    _initSources(numSources: number): void;
    createSource(i: number): HydraSource;
    _generateGlslTransforms(): void;
    _render: (output: Output) => void;
    tick: (dt: number) => void;
}
export {};
