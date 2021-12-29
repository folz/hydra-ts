import { DefaultContext, DrawCommand, Regl, Resource } from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
export declare type Precision = 'lowp' | 'mediump' | 'highp';
export declare type Resolution = [number, number];
export interface HydraFboUniforms {
    tex0: Resource;
    resolution: Resolution;
}
export interface HydraDrawUniforms {
    time: number;
    resolution: Resolution;
}
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
    render: (output?: Output) => void;
    setResolution: (width: number, height: number) => void;
    hush: () => void;
    sources: Source[];
    outputs: Output[];
}
interface HydraRendererOptions {
    width?: number;
    height?: number;
    numSources?: number;
    numOutputs?: number;
    regl: Regl;
    precision?: Precision;
}
export declare class HydraRenderer {
    width: number;
    height: number;
    synth: Synth;
    timeSinceLastUpdate: number;
    precision: Precision;
    regl: Regl;
    renderFbo: DrawCommand<DefaultContext, HydraFboUniforms>;
    output: Output;
    loop: Loop;
    constructor({ width, height, numSources, numOutputs, precision, regl, }: HydraRendererOptions);
    hush: () => void;
    setResolution: (width: number, height: number) => void;
    render: (output?: Output | undefined) => void;
    tick: (dt: number) => void;
}
export {};
