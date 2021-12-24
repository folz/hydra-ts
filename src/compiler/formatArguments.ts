import { TransformApplication } from '../GlslSource';
import arrayUtils from '../lib/array-utils';
import { getJsValueType, JsValueType } from './convertJsValueToGlsl';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';

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
  const defaultArgs = transformApplication.transform.inputs;
  const userArgs = transformApplication.userArgs;
  return defaultArgs.map((input, index) => {
    const typedArg: TypedArg = {
      value: input.default,
      type: input.type, //
      isUniform: false,
      name: input.name,
      vecLen: input.vecLen ?? 0,
    };

    if (typedArg.type === 'float') {
      typedArg.value = ensureDecimalDot(input.default);
    }

    // if user has input something for this argument
    if (userArgs.length > index) {
      const arg = userArgs[index];

      typedArg.value = arg;
      // do something if a composite or transformApplication

      if (typeof arg === 'function') {
        if (typedArg.vecLen > 0) {
          // expected input is a vector, not a scalar
          typedArg.value = (context, props) =>
            fillArrayWithDefaults(arg(props), typedArg.vecLen);
        } else {
          typedArg.value = (context, props) => {
            try {
              return arg(props);
            } catch (e) {
              console.log('ERROR', e);
              return input.default;
            }
          };
        }

        typedArg.isUniform = true;
      } else if (arg.constructor === Array) {
        if (typedArg.vecLen > 0) {
          // expected input is a vector, not a scalar
          typedArg.isUniform = true;
          typedArg.value = fillArrayWithDefaults(
            typedArg.value,
            typedArg.vecLen,
          );
        } else {
          // is Array
          typedArg.value = (context, props) => arrayUtils.getValue(arg)(props);
          typedArg.isUniform = true;
        }
      }
    }

    const valueType = getJsValueType(typedArg.value);

    if (valueType === JsValueType.HydraSource) {
      // GLSLSource

      const finalTransform =
        typedArg.value.transforms[typedArg.value.transforms.length - 1];

      if (finalTransform.transform.glsl_return_type !== input.type) {
        const defaults = DEFAULT_CONVERSIONS[input.type];
        if (typeof defaults !== 'undefined') {
          const default_def =
            defaults[finalTransform.transform.glsl_return_type];
          if (typeof default_def !== 'undefined') {
            const { name, args } = default_def;
            typedArg.value = typedArg.value[name](...args);
          }
        }
      }

      typedArg.isUniform = false;
    } else if (typedArg.type === 'float' && valueType === JsValueType.Number) {
      // Number

      typedArg.value = ensureDecimalDot(typedArg.value);
    } else if (
      typedArg.type.startsWith('vec') &&
      valueType === JsValueType.Array
    ) {
      // Vector literal (as array)

      typedArg.isUniform = false;
      typedArg.value = `${typedArg.type}(${typedArg.value
        .map(ensureDecimalDot)
        .join(', ')})`;
    } else if (input.type === 'sampler2D') {
      // typedArg.tex = typedArg.value
      const x = typedArg.value;
      typedArg.value = () => x.getTexture();
      typedArg.isUniform = true;
    } else if (valueType === JsValueType.HydraOutput) {
      // Output (o0, o1, o2, o3, etc)

      // if passing in a texture reference, when function asks for vec4, convert to vec4
      if (typedArg.value.getTexture && input.type === 'vec4') {
        const x1 = typedArg.value;
        // TODO: get texture without relying on makeGlobal src()
        typedArg.value = src(x1);
        typedArg.isUniform = false;
      }
    }

    // add tp uniform array if is a function that will pass in a different value on each render frame,
    // or a texture/ external source

    if (typedArg.isUniform) {
      typedArg.name += startIndex;
      //  shaderParams.uniforms.push(typedArg)
    }

    return typedArg;
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
