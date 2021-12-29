import { createGenerators } from './createGenerators';
import { generatorTransforms, modifierTransforms, } from './transformDefinitions';
export const { gradient, noise, osc, shape, solid, src, voronoi } = createGenerators({
    generatorTransforms,
    modifierTransforms,
});
