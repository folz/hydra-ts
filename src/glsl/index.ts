import {
  createGenerators,
  createTransformChainClass,
} from './createGenerators.js';
import {
  generatorTransforms,
  modifierTransforms,
} from './transformDefinitions.js';

const TransformChainClass = createTransformChainClass(modifierTransforms);
const generators = createGenerators(generatorTransforms, TransformChainClass);

export const { gradient, noise, osc, prev, shape, solid, src, voronoi } =
  generators;
