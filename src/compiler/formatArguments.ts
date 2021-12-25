import { GlslSource, TransformApplication } from '../GlslSource';
import arrayUtils from '../lib/array-utils';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';
import { Output } from '../Output';

const DEFAULT_CONVERSIONS = {
  float: {
    vec4: { name: 'sum', args: [[1, 1, 1, 1]] },
    vec2: { name: 'sum', args: [[1, 1]] },
  },
  vec4: undefined,
  sampler2D: undefined,
  texture: undefined,
} as const;

export interface TypedArg {
  value: TransformDefinitionInput['default'];
  type: TransformDefinitionInput['type'];
  isUniform: boolean;
  name: TransformDefinitionInput['name'];
  vecLen: number;
}

export function formatArguments(
  transformApplication: TransformApplication,
  startIndex: number,
): TypedArg[] {
  const { transform, userArgs } = transformApplication;
  const { inputs } = transform;

  return inputs.map((input, index) => {
    const vecLen = input.vecLen ?? 0;

    let value: any = input.default;
    let isUniform = false;

    if (input.type === 'float') {
      value = ensureDecimalDot(value);
    }

    // if user has input something for this argument
    if (userArgs.length > index) {
      const arg = userArgs[index];

      value = arg;
      // do something if a composite or transformApplication

      if (typeof arg === 'function') {
        if (vecLen > 0) {
          // expected input is a vector, not a scalar
          value = (context: any, props: any) =>
            fillArrayWithDefaults(arg(props), vecLen);
        } else {
          value = (context: any, props: any) => {
            try {
              return arg(props);
            } catch (e) {
              console.log('ERROR', e);
              return input.default;
            }
          };
        }

        isUniform = true;
      } else if (Array.isArray(arg)) {
        if (vecLen > 0) {
          // expected input is a vector, not a scalar
          isUniform = true;
          value = fillArrayWithDefaults(value, vecLen);
        } else {
          // is Array
          value = (context: any, props: any) => arrayUtils.getValue(arg)(props);
          isUniform = true;
        }
      }
    }

    if (value instanceof GlslSource) {
      // GLSLSource

      const finalTransform = value.transforms[value.transforms.length - 1];

      if (finalTransform.transform.glsl_return_type !== input.type) {
        const defaults = DEFAULT_CONVERSIONS[input.type];
        if (typeof defaults !== 'undefined') {
          const default_def =
            defaults[finalTransform.transform.glsl_return_type];
          if (typeof default_def !== 'undefined') {
            const { name, args } = default_def;
            value = value[name](...args);
          }
        }
      }

      isUniform = false;
    } else if (input.type === 'float' && typeof value === 'number') {
      // Number

      value = ensureDecimalDot(value);
    } else if (input.type.startsWith('vec') && Array.isArray(value)) {
      // Vector literal (as array)

      isUniform = false;
      value = `${input.type}(${value.map(ensureDecimalDot).join(', ')})`;
    } else if (input.type === 'sampler2D') {
      const x = value;
      value = () => x.getTexture();
      isUniform = true;
    } else if (value instanceof Output) {
      // if passing in a texture reference, when function asks for vec4, convert to vec4
      if (input.type === 'vec4') {
        const x1 = value;
        // TODO: get texture without relying on makeGlobal src()
        value = src(x1);
        isUniform = false;
      }
    }

    // add tp uniform array if is a function that will pass in a different value on each render frame,
    // or a texture/ external source

    let { name } = input;
    if (isUniform) {
      name += startIndex;
    }

    return {
      value,
      type: input.type,
      isUniform,
      vecLen,
      name,
    };
  });
}

function mergeDefaultsAndArgs(
  defaults: readonly any[],
  args: readonly any[],
): any[] {
  let suppliedUserArgs = args.slice(0, defaults.length);
  let remainingDefaultArgs = defaults.slice(suppliedUserArgs.length);

  return [...suppliedUserArgs, ...remainingDefaultArgs];
}

export function ensureDecimalDot(val: any): string {
  val = val.toString();
  if (val.indexOf('.') < 0) {
    val += '.';
  }
  return val;
}

export function fillArrayWithDefaults(arr: any[], len: number) {
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
