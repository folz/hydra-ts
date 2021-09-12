import Generator from './src/generator-factory';
import Sandbox from './src/eval-sandbox';
export default class ShaderGenerator {
    generator: Generator;
    renderer: Record<string, any>;
    sandbox: Sandbox;
    initialCode: string;
    generatedCode: unknown;
    constructor({ defaultUniforms, customUniforms, extendTransforms, }?: {
        defaultUniforms?: {
            time: number;
            resolution: number[];
        } | undefined;
        customUniforms?: string[] | undefined;
        extendTransforms?: never[] | undefined;
    });
    eval(code: string): unknown;
}
