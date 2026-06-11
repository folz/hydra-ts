import { Glsl, TransformApplication } from '../glsl/Glsl';
import arrayUtils from '../lib/array-utils';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';
import { src } from '../glsl/index';

export interface TypedArg {
  value: unknown;
  type: TransformDefinitionInput['type'];
  isUniform: boolean;
  name: TransformDefinitionInput['name'];
  vecLen: number;
}

interface HasGetTexture {
  getTexture: () => unknown;
}

function hasGetTexture(value: unknown): value is HasGetTexture {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as HasGetTexture).getTexture === 'function'
  );
}

// This is a port of hydra-synth's src/format-arguments.js, with one
// deliberate difference: upstream resolves `src` through the transform's
// back-reference to the synth (`transform.synth.generators.src`), whereas
// hydra-ts imports it directly to avoid the global-environment coupling.
export function formatArguments(
  transformApplication: TransformApplication,
  startIndex: number,
): TypedArg[] {
  const { transform, userArgs } = transformApplication;
  const { inputs } = transform;

  return inputs.map((input, index) => {
    const typedArg: TypedArg = {
      value: input.default,
      type: input.type,
      isUniform: false,
      name: input.name,
      vecLen: 0,
    };

    if (typedArg.type === 'float') {
      typedArg.value = ensureDecimalDot(input.default);
    }

    if (input.type.startsWith('vec')) {
      typedArg.vecLen = Number.parseInt(input.type.slice(3), 10);
    }

    // if user has input something for this argument
    if (userArgs.length > index) {
      const arg = userArgs[index];

      typedArg.value = arg;

      if (typedArg.type === 'vec4') {
        if (!(arg instanceof Glsl || hasGetTexture(arg))) {
          throw new Error('Arguments must be a texture or GlslSource');
        }
      }
      // do something if a composite or transformApplication

      if (typeof arg === 'function') {
        typedArg.value = (context: unknown, props: unknown) => {
          try {
            const val = arg(props);
            if (typeof val === 'number') {
              return val;
            } else {
              console.warn('function does not return a number', arg);
            }
            return input.default;
          } catch (e) {
            console.warn('ERROR', e);
            return input.default;
          }
        };

        typedArg.isUniform = true;
      } else if (Array.isArray(arg)) {
        typedArg.value = (context: unknown, props: unknown) =>
          arrayUtils.getValue(arg)(props);
        typedArg.isUniform = true;
      }
    }

    if (typedArg.value instanceof Glsl) {
      // GlslSource: gets inlined into the shader by generateGlsl

      typedArg.isUniform = false;
    } else if (
      typedArg.type === 'float' &&
      typeof typedArg.value === 'number'
    ) {
      // Number

      typedArg.value = ensureDecimalDot(typedArg.value);
    } else if (
      typedArg.type.startsWith('vec') &&
      Array.isArray(typedArg.value)
    ) {
      // Vector literal (as array)

      typedArg.isUniform = false;
      typedArg.value = `${typedArg.type}(${typedArg.value
        .map(ensureDecimalDot)
        .join(', ')})`;
    } else if (input.type === 'sampler2D') {
      const ref = typedArg.value as HasGetTexture;

      typedArg.value = () => ref.getTexture();
      typedArg.isUniform = true;
    } else {
      if (typedArg.value === undefined || typedArg.value === null) {
        // upstream crashes here too (a TypeError reading `.getTexture` of
        // undefined); fail with a clearer message. This is hit when a
        // combine/combineCoord is called without its source argument, or by
        // custom definitions that declare the source input explicitly (it is
        // implicit — see the custom-transforms section of the README).
        throw new Error(
          `No value for input '${input.name}' of '${transform.name}'. ` +
            'Combine/combineCoord transforms receive their source input ' +
            'implicitly; it must not be declared in the definition.',
        );
      }
      // if passing in a texture reference, when function asks for vec4, convert to vec4
      if (hasGetTexture(typedArg.value) && input.type === 'vec4') {
        typedArg.value = src(typedArg.value);
        typedArg.isUniform = false;
      }
    }

    // add to uniform array if is a function that will pass in a different
    // value on each render frame, or a texture/external source

    if (typedArg.isUniform) {
      typedArg.name += startIndex;
    }

    return typedArg;
  });
}

export function ensureDecimalDot(val: unknown): string {
  const str = String(val);
  if (str.indexOf('.') < 0) {
    return str + '.';
  }
  return str;
}

export function fillArrayWithDefaults(arr: unknown[], len: number) {
  // fill the array with default values if it's too short
  while (arr.length < len) {
    if (arr.length === 3) {
      // push a 1 as the default for .a in vec4
      arr.push(1.0);
    } else {
      arr.push(0.0);
    }
  }
  return arr.slice(0, len);
}
