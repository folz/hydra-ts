import { transforms } from './glsl/transformDefinitions';
import { processGlsl } from './GeneratorFactory';

test.each(transforms)('processGlsl($definition.name)', (definition) => {
  expect(definition).toMatchSnapshot('initial');

  const processed = processGlsl(definition);

  expect(processed).toMatchSnapshot('processed');
});
