import { generateGlsl } from './generateGlsl';
export function compileGlsl(transformApplications) {
    const shaderParams = {
        uniforms: [],
        transformApplications: [],
        fragColor: '',
    };
    // Note: generateGlsl() also mutates shaderParams.transformApplications
    shaderParams.fragColor = generateGlsl(transformApplications, shaderParams)('st');
    // remove uniforms with duplicate names
    let uniforms = {};
    shaderParams.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
    shaderParams.uniforms = Object.values(uniforms);
    return shaderParams;
}
