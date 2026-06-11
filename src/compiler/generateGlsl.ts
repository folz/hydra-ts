import { Glsl, TransformApplication } from '../glsl/Glsl.js';
import { formatArguments, TypedArg } from './formatArguments.js';
import { ShaderParams } from './compileWithEnvironment.js';

// This is a port of hydra-synth's src/generate-glsl.js. The emitted shader
// code (including whitespace) is kept byte-identical to upstream so that
// compiled fragment shaders can be compared 1:1 against hydra-synth's. See
// test/equivalence for the tests asserting this.

export type GlslGenerator = (c: string, uv: string) => string;

export function generateGlsl(
  transformApplications: TransformApplication[],
  shaderParams: ShaderParams,
): GlslGenerator {
  let generator: GlslGenerator = () => '';

  transformApplications.forEach((transformApplication, i) => {
    // Accumulate uniforms to lazily add them to the output shader
    const inputs = formatArguments(
      transformApplication,
      shaderParams.uniforms.length,
    );

    inputs.forEach((input) => {
      if (input.isUniform) {
        shaderParams.uniforms.push(input);
      }
    });

    // Lazily generate glsl function definition
    if (!contains(transformApplication, shaderParams.transformApplications)) {
      shaderParams.transformApplications.push(transformApplication);
    }

    const prev = generator;
    const { name, type } = transformApplication.transform;

    if (type === 'src') {
      generator = (c, uv) =>
        `${generateInputs(inputs, shaderParams)(`${c}${i}`, uv)}
         vec4 ${c} = ${shaderString(`${c}${i}`, uv, name, inputs)};`;
    } else if (type === 'color') {
      generator = (c, uv) =>
        `${generateInputs(inputs, shaderParams)(`${c}${i}`, uv)}
         ${prev(c, uv)}
         ${c} = ${shaderString(`${c}${i}`, `${c}`, name, inputs)};`;
    } else if (type === 'coord') {
      generator = (c, uv) =>
        `${generateInputs(inputs, shaderParams)(`${c}${i}`, uv)}
         ${uv} = ${shaderString(`${c}${i}`, `${uv}`, name, inputs)};
         ${prev(c, uv)}`;
    } else if (type === 'combine') {
      // combining two generated shader strings (i.e. for blend, mult, add funtions)
      generator = (c, uv) =>
        `${generateInputs(inputs, shaderParams)(`${c}${i}`, uv)}
         ${prev(c, uv)}
         ${c} = ${shaderString(`${c}${i}`, `${c}`, name, inputs)};`;
    } else if (type === 'combineCoord') {
      // combining two generated shader strings (i.e. for modulate functions)
      generator = (c, uv) =>
        `${generateInputs(inputs, shaderParams)(`${c}${i}`, uv)}
         ${uv} = ${shaderString(`${c}${i}`, `${uv}`, name, inputs)};
         ${prev(c, uv)}`;
    }
  });

  return generator;
}

function generateInputName(v: string, index: number): string {
  return `${v}_i${index}`;
}

// Emits the statements computing each input that is itself a transform chain
// (e.g. the `osc()` in `solid().blend(osc())`). Each nested chain gets its
// own copy of the current uv so coord transforms inside it stay local.
function generateInputs(
  inputs: TypedArg[],
  shaderParams: ShaderParams,
): GlslGenerator {
  let generator: GlslGenerator = () => '';

  inputs.forEach((input, i) => {
    const nestedTransforms = nestedTransformsOf(input.value);

    if (nestedTransforms) {
      const prev = generator;
      generator = (c, uv) => {
        const ci = generateInputName(c, i);
        const uvi = generateInputName(`${uv}_${c}`, i);
        return `vec2 ${uvi} = ${uv};${prev(c, uv)}
         ${generateGlsl(nestedTransforms, shaderParams)(ci, uvi)}`;
      };
    }
  });

  return generator;
}

// assembles a shader string containing the arguments and the function name, i.e. 'osc(uv, frequency)'
function shaderString(
  c: string,
  uv: string,
  method: string,
  inputs: TypedArg[],
): string {
  const str = inputs
    .map((input, i) => {
      if (input.isUniform) {
        return input.name;
      } else if (nestedTransformsOf(input.value)) {
        // this by definition needs to be a generator
        // use the variable created for generator inputs in `generateInputs`
        return generateInputName(c, i);
      }
      return input.value;
    })
    .reduce((p, c) => `${p}, ${c}`, '');

  return `${method}(${uv}${str})`;
}

function nestedTransformsOf(
  value: TypedArg['value'],
): TransformApplication[] | undefined {
  if (value instanceof Glsl) {
    return value.transforms.toArray();
  }
  return undefined;
}

function contains(
  transformApplication: TransformApplication,
  transformApplications: TransformApplication[],
): boolean {
  for (let i = 0; i < transformApplications.length; i++) {
    if (
      transformApplication.transform.name ===
      transformApplications[i].transform.name
    ) {
      return true;
    }
  }
  return false;
}
