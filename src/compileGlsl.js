import { generateGlsl } from './compiler/generateGlsl';
export function compileGlsl(transforms) {
    const shaderParams = {
        uniforms: [],
        glslFunctions: [],
        fragColor: '',
    };
    const gen = generateGlsl(transforms, shaderParams)('st');
    shaderParams.fragColor = gen;
    // remove uniforms with duplicate names
    let uniforms = {};
    shaderParams.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
    shaderParams.uniforms = Object.values(uniforms);
    return shaderParams;
}
