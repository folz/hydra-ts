import { Output } from './Output';
import { Loop } from './Loop';
import { HydraSource } from './HydraSource';
import { DrawCommand, Regl } from 'regl';
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
    hush: () => void;
    [name: string]: any;
}
interface HydraRendererOptions {
    width?: HydraRenderer['width'];
    height?: HydraRenderer['height'];
    numSources?: number;
    numOutputs?: number;
    regl: HydraRenderer['regl'];
    precision?: HydraRenderer['precision'];
}
export declare class HydraRenderer {
    width: number;
    height: number;
    synth: Synth;
    timeSinceLastUpdate: number;
    precision: Precision;
    regl: Regl;
    renderFbo: DrawCommand;
    s: HydraSource[];
    o: Output[];
    output: Output;
    loop: Loop;
    constructor({ width, height, numSources, numOutputs, precision, regl, }: HydraRendererOptions);
    hush: () => void;
    setResolution: (width: number, height: number) => void;
    render: (output: Output) => void;
    tick: (dt: number) => void;
}
export {};
