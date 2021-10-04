import { transforms } from './glsl/glsl-functions';
import { processGlsl } from './generator-factory';

test.each(transforms)('processGlsl($definition.name)', (definition) => {
  expect(definition).toMatchSnapshot('initial');

  const processed = processGlsl(definition);

  expect(processed).toMatchSnapshot('processed');

  // processGlsl mutates definition inputs, so capture that change in test too.
  const processed2 = processGlsl(definition);
  expect(processed2).toMatchSnapshot('processed+mutated');
});
