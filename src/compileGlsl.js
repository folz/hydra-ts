import produce from 'immer';
import { generateGlsl } from './compiler/generateGlsl';
export function compileGlsl(transformApplications) {
    const shaderParams = {
        uniforms: [],
        transformApplications: [],
        fragColor: '',
    };
    const newParams = produce(shaderParams, (draft) => {
        draft.fragColor = generateGlsl(transformApplications, draft)('st');
        // remove uniforms with duplicate names
        let uniforms = {};
        draft.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
        draft.uniforms = Object.values(uniforms);
    });
    console.log(shaderParams, newParams);
    return newParams;
}
