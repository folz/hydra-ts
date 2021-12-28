import { Attributes, DrawCommand, DynamicVariable, DynamicVariableFn, Framebuffer2D, Regl } from 'regl';
import { Precision } from './HydraRenderer';
import { TransformApplication } from './Glsl';
interface OutputOptions {
    defaultUniforms: Output['defaultUniforms'];
    height: number;
    precision: Output['precision'];
    regl: Output['regl'];
    width: number;
}
export declare class Output {
    attributes: Attributes;
    defaultUniforms?: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    draw: DrawCommand;
    fbos: Framebuffer2D[];
    pingPongIndex: number;
    precision: Precision;
    regl: Regl;
    vert: string;
    constructor({ defaultUniforms, height, precision, regl, width, }: OutputOptions);
    resize(width: number, height: number): void;
    getCurrent(): Framebuffer2D;
    getTexture(): Framebuffer2D;
    render(transformApplications: TransformApplication[]): void;
    tick(props: {}): void;
}
export {};
