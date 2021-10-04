import { Attributes, Buffer, DrawCommand, Framebuffer2D, Regl, Uniforms } from 'regl';
import { Precision } from '../hydra-synth';
import { CompiledTransform } from './glsl-source';
interface OutputOptions {
    regl: Output['regl'];
    precision: Output['precision'];
    width: number;
    height: number;
}
export declare class Output {
    regl: Regl;
    precision: Precision;
    positionBuffer: Buffer;
    draw: DrawCommand;
    pingPongIndex: number;
    fbos: Framebuffer2D[];
    vert: string;
    uniforms: Uniforms;
    attributes: Attributes;
    constructor({ regl, precision, width, height }: OutputOptions);
    resize(width: number, height: number): void;
    getCurrent(): Framebuffer2D;
    getTexture(): Framebuffer2D;
    render(passes: CompiledTransform[]): void;
    tick(props: {}): void;
}
export {};
