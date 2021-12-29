import { DefaultContext, DrawCommand, Regl, Resource } from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
export declare type Precision = 'lowp' | 'mediump' | 'highp';
export declare type Resolution = [number, number];
export interface HydraFboUniforms {
    resolution: Resolution;
    tex0: Resource;
}
export interface HydraDrawUniforms {
    resolution: Resolution;
    time: number;
}
export interface Synth {
    bpm: number;
    fps?: number;
    resolution: Resolution;
    speed: number;
    stats: {
        fps: number;
    };
    time: number;
}
interface HydraRendererOptions {
    height: number;
    numOutputs?: number;
    numSources?: number;
    precision?: Precision;
    regl: Regl;
    width: number;
}
export declare class Hydra {
    loop: Loop;
    output: Output;
    precision: Precision;
    regl: Regl;
    renderFbo: DrawCommand<DefaultContext, HydraFboUniforms>;
    synth: Synth;
    timeSinceLastUpdate: number;
    outputs: Output[];
    sources: Source[];
    constructor({ height, numOutputs, numSources, precision, regl, width, }: HydraRendererOptions);
    hush: () => void;
    setResolution: (width: number, height: number) => void;
    render: (output?: Output | undefined) => void;
    tick: (dt: number) => void;
}
export {};
