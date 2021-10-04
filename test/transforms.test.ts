import HydraSynth from '../index';
import REGL, { Regl } from 'regl';
import gl from 'gl';

describe.skip('Transforms', function () {
  const dimensions = {
    width: 100,
    height: 100,
  };

  let regl: Regl;

  beforeEach(function () {
    regl = REGL(gl(800, 600));
  });

  describe('src transforms', function () {
    describe('solid', function () {
      it('Fills the buffer completely with the expected value', function () {
        const hydra = new HydraSynth({
          autoLoop: false,
          makeGlobal: false,
          regl,
        });

        hydra.synth.generators.solid(1, 0, 1, 0.5).out(hydra.o[0]);

        hydra.tick();

        const pixels = hydra.regl.read();

        for (let i = 0; i < dimensions.width * dimensions.height; i++) {
          expect(pixels[i * 4 + 0]).toBe(255);
          expect(pixels[i * 4 + 1]).toBe(0);
          expect(pixels[i * 4 + 2]).toBe(255);
          expect(pixels[i * 4 + 3]).toBe(128);
        }
      });
    });
  });
});
