import { formatArguments } from './formatArguments';
import { shaderString } from './shaderString';
export function generateGlsl(transformApplications, shaderParams) {
    let fragColor = () => '';
    transformApplications.forEach((transformApplication) => {
        let f1;
        const typedArgs = formatArguments(transformApplication, shaderParams.uniforms.length);
        typedArgs.forEach((typedArg) => {
            if (typedArg.isUniform) {
                shaderParams.uniforms.push(typedArg);
            }
        });
        // add new glsl function to running list of functions
        if (!contains(transformApplication, shaderParams.transformApplications)) {
            shaderParams.transformApplications.push(transformApplication);
        }
        // current function for generating frag color shader code
        const f0 = fragColor;
        if (transformApplication.transform.type === 'src') {
            fragColor = (uv) => `${shaderString(uv, transformApplication, typedArgs, shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'coord') {
            fragColor = (uv) => `${f0(`${shaderString(uv, transformApplication, typedArgs, shaderParams)}`)}`;
        }
        else if (transformApplication.transform.type === 'color') {
            fragColor = (uv) => `${shaderString(`${f0(uv)}`, transformApplication, typedArgs, shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'combine') {
            // combining two generated shader strings (i.e. for blend, mult, add funtions)
            f1 =
                typedArgs[0].value && typedArgs[0].value.transforms
                    ? (uv) => `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
                    : typedArgs[0].isUniform
                        ? () => typedArgs[0].name
                        : () => typedArgs[0].value;
            fragColor = (uv) => `${shaderString(`${f0(uv)}, ${f1(uv)}`, transformApplication, typedArgs.slice(1), shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'combineCoord') {
            // combining two generated shader strings (i.e. for modulate functions)
            f1 =
                typedArgs[0].value && typedArgs[0].value.transforms
                    ? (uv) => `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
                    : typedArgs[0].isUniform
                        ? () => typedArgs[0].name
                        : () => typedArgs[0].value;
            fragColor = (uv) => `${f0(`${shaderString(`${uv}, ${f1(uv)}`, transformApplication, typedArgs.slice(1), shaderParams)}`)}`;
        }
    });
    return fragColor;
}
export function contains(transformApplication, transformApplications) {
    for (let i = 0; i < transformApplications.length; i++) {
        if (transformApplication.transform.name ==
            transformApplications[i].transform.name) {
            return true;
        }
    }
    return false;
}
