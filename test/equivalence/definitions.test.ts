import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

// the only internal module hydra-synth's exports map exposes directly
// @ts-ignore - untyped upstream javascript
import upstreamGlslFunctions from 'hydra-synth/src/glsl/glsl-functions.js';
// @ts-ignore - untyped upstream javascript
import UpstreamGeneratorFactory from '../../node_modules/hydra-synth/src/generator-factory.js';
// @ts-ignore - untyped upstream javascript
import upstreamUtilityFunctions from '../../node_modules/hydra-synth/src/glsl/utility-functions.js';

import {
  generatorTransforms,
  modifierTransforms,
} from '../../src/glsl/transformDefinitions';
import { processGlsl } from '../../src/glsl/createGenerators';
import { utilityFunctions } from '../../src/glsl/utilityFunctions';

const EXPECTED_UPSTREAM_VERSION = '1.4.0';

const ourTransforms = [...generatorTransforms, ...modifierTransforms];

test(`equivalence target is hydra-synth@${EXPECTED_UPSTREAM_VERSION}`, () => {
  // If this fails after a dependency bump: re-run
  // scripts/generate-transform-definitions.mjs, review the diff, and update
  // EXPECTED_UPSTREAM_VERSION.
  const pkg = JSON.parse(
    readFileSync(
      new URL('../../node_modules/hydra-synth/package.json', import.meta.url),
      'utf8',
    ),
  );
  expect(pkg.version).toBe(EXPECTED_UPSTREAM_VERSION);
});

describe('transform definitions', () => {
  const upstream = upstreamGlslFunctions();

  test('hydra-ts defines exactly the same transforms as upstream', () => {
    expect(ourTransforms.map((t) => t.name).sort()).toEqual(
      upstream.map((t: any) => t.name).sort(),
    );
  });

  test('generators are exactly the src-type transforms', () => {
    expect(generatorTransforms.map((t) => t.name)).toEqual(
      upstream.filter((t: any) => t.type === 'src').map((t: any) => t.name),
    );
  });

  for (const upstreamTransform of upstreamGlslFunctions()) {
    test(`'${upstreamTransform.name}' definition is identical to upstream`, () => {
      const ours = ourTransforms.find((t) => t.name === upstreamTransform.name);
      expect(ours).toBeDefined();
      expect({
        name: ours!.name,
        type: ours!.type,
        inputs: ours!.inputs,
        glsl: ours!.glsl,
      }).toEqual({
        name: upstreamTransform.name,
        type: upstreamTransform.type,
        inputs: upstreamTransform.inputs,
        glsl: upstreamTransform.glsl,
      });
    });
  }
});

describe('processed glsl functions', () => {
  // Upstream processes definitions inside GeneratorFactory.init(); the
  // processed results live in factory.glslTransforms.
  const factory = new UpstreamGeneratorFactory({
    defaultUniforms: {},
    defaultOutput: { precision: 'mediump' },
    changeListener: () => {},
  });

  for (const transform of ourTransforms) {
    test(`processGlsl('${transform.name}') matches upstream`, () => {
      const processed = processGlsl(transform);
      const upstreamProcessed = factory.glslTransforms[transform.name];

      expect(upstreamProcessed).toBeDefined();
      // identical generated glsl function (signature + body)
      expect(processed.glsl).toBe(upstreamProcessed.glsl);
      // identical runtime input list (the implicit first argument is
      // stripped; combine/combineCoord keep their second implicit argument)
      expect(
        processed.inputs.map(({ name, type, default: def }) => ({
          name,
          type,
          default: def,
        })),
      ).toEqual(
        upstreamProcessed.inputs.map(({ name, type, default: def }: any) => ({
          name,
          type,
          default: def,
        })),
      );
    });
  }

  test('processGlsl does not mutate the input definition', () => {
    const original = modifierTransforms.find((t) => t.name === 'blend')!;
    const inputsBefore = JSON.stringify(original.inputs);
    processGlsl(original);
    expect(JSON.stringify(original.inputs)).toBe(inputsBefore);
  });
});

describe('utility glsl functions', () => {
  test('identical to upstream (same functions, same order, same glsl)', () => {
    expect(Object.keys(utilityFunctions)).toEqual(
      Object.keys(upstreamUtilityFunctions),
    );
    for (const name of Object.keys(upstreamUtilityFunctions)) {
      expect(utilityFunctions[name as keyof typeof utilityFunctions].glsl).toBe(
        upstreamUtilityFunctions[name].glsl,
      );
    }
  });
});
