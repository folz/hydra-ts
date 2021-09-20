import { Attributes, Buffer, DrawCommand, Framebuffer2D, Regl, Uniforms } from 'regl';
import { Precision } from '../hydra-synth';
import { CompiledTransform } from './glsl-source';
interface OutputOptions {
    regl: Output['regl'];
    precision: Output['precision'];
    label: Output['label'];
    width: number;
    height: number;
}
declare class Output {
    regl: Regl;
    precision: Precision;
    label: string;
    positionBuffer: Buffer;
    draw: DrawCommand;
    pingPongIndex: number;
    fbos: Framebuffer2D[];
    transformIndex: number;
    fragHeader: string;
    fragBody: string;
    frag: string;
    vert: string;
    uniforms: Uniforms;
    attributes: Attributes;
    id?: number;
    constructor({ regl, precision, label, width, height }: OutputOptions);
    resize(width: number, height: number): void;
    getCurrent(): Framebuffer2D;
    getTexture(): Framebuffer2D;
    init(): this;
    render(passes: CompiledTransform[]): void;
    tick(props: {}): void;
}
export default Output;
