import { formatArguments } from './formatArguments';
import { contains } from './contains';
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
        if (!contains(transformApplication, shaderParams.glslFunctions)) {
            shaderParams.glslFunctions.push(transformApplication);
        }
        // current function for generating frag color shader code
        const f0 = fragColor;
        if (transformApplication.transform.type === 'src') {
            fragColor = (uv) => `${shaderString(uv, transformApplication.transform.name, typedArgs, shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'coord') {
            fragColor = (uv) => `${f0(`${shaderString(uv, transformApplication.transform.name, typedArgs, shaderParams)}`)}`;
        }
        else if (transformApplication.transform.type === 'color') {
            fragColor = (uv) => `${shaderString(`${f0(uv)}`, transformApplication.transform.name, typedArgs, shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'combine') {
            // combining two generated shader strings (i.e. for blend, mult, add funtions)
            f1 =
                typedArgs[0].value && typedArgs[0].value.transforms
                    ? (uv) => `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
                    : typedArgs[0].isUniform
                        ? () => typedArgs[0].name
                        : () => typedArgs[0].value;
            fragColor = (uv) => `${shaderString(`${f0(uv)}, ${f1(uv)}`, transformApplication.transform.name, typedArgs.slice(1), shaderParams)}`;
        }
        else if (transformApplication.transform.type === 'combineCoord') {
            // combining two generated shader strings (i.e. for modulate functions)
            f1 =
                typedArgs[0].value && typedArgs[0].value.transforms
                    ? (uv) => `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
                    : typedArgs[0].isUniform
                        ? () => typedArgs[0].name
                        : () => typedArgs[0].value;
            fragColor = (uv) => `${f0(`${shaderString(`${uv}, ${f1(uv)}`, transformApplication.transform.name, typedArgs.slice(1), shaderParams)}`)}`;
        }
    });
    return fragColor;
}
