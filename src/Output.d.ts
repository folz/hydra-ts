import { Attributes, DrawCommand, DynamicVariable, DynamicVariableFn, Framebuffer2D, Regl } from 'regl';
import { Precision, Synth } from './Hydra';
import { TransformApplication } from './glsl/Glsl';
interface OutputOptions {
    defaultUniforms: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    height: number;
    precision: Precision;
    regl: Regl;
    width: number;
}
export declare class Output {
    attributes: Attributes;
    defaultUniforms?: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    draw: DrawCommand;
    fbos: Framebuffer2D[];
    precision: Precision;
    regl: Regl;
    vert: string;
    pingPongIndex: number;
    constructor({ defaultUniforms, height, precision, regl, width, }: OutputOptions);
    resize(width: number, height: number): void;
    getCurrent(): Framebuffer2D;
    getTexture(): Framebuffer2D;
    render(transformApplications: TransformApplication[]): void;
    tick(props: Synth): void;
}
export {};
