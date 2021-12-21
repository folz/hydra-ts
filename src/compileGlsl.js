import produce from 'immer';
import { generateGlsl } from './compiler/generateGlsl';
export function compileGlsl(transforms) {
    const shaderParams = {
        uniforms: [],
        glslFunctions: [],
        fragColor: '',
    };
    const newParams = produce(shaderParams, (draft) => {
        draft.fragColor = generateGlsl(transforms, draft)('st');
        // remove uniforms with duplicate names
        let uniforms = {};
        draft.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
        draft.uniforms = Object.values(uniforms);
    });
    console.log(shaderParams, newParams);
    return newParams;
}
