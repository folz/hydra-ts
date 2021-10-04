import REGL from 'regl';
import gl from 'gl';

import HydraSynth from '../index';

import { transforms } from '../src/glsl/glsl-functions';

describe.skip('HydraSynth', function () {
  let regl;

  beforeEach(function () {
    regl = REGL(gl(800, 600));
  });

  it('Sets up basic infrastructure', function () {
    const hydra = new HydraSynth({
      autoLoop: false,
      makeGlobal: false,
      regl,
    });

    // expect(hydra).toEqual(expect.arrayContaining(['s', 'a', 'audio', 'bpm']));

    expect(hydra.bpm).toEqual(60);
  });

  describe('makeGlobal', function () {
    it('Does not create global variables if set to false', function () {
      const prev_keys = Object.keys(window);

      // eslint-disable-next-line no-unused-vars
      const hydra = new HydraSynth({
        autoLoop: false,
        makeGlobal: false,
        regl,
      });

      const new_keys = Object.keys(window).filter((x) => prev_keys.indexOf(x) < 0);

      expect(new_keys).toHaveLength(0);
    });

    it('Creates expected global variables if set to true', function () {
      const prev_keys = Object.keys(window);

      const hydra = new HydraSynth({
        autoLoop: false,
        makeGlobal: true,
        regl,
      });

      const new_keys = Object.keys(window).filter((x) => prev_keys.indexOf(x) < 0);

      expect(new_keys).toEqual(
        expect.arrayContaining([
          ...Object.entries(transforms)
            .filter(([, transform]) => transform.type === 'src')
            .map(([name]) => name),
          ...Array(hydra.s.length)
            .fill(1)
            .map((_, i) => `s${i}`),
          ...Array(hydra.audio.bins.length)
            .fill(1)
            .map((_, i) => `a${i}`),
          'bpm',
          'time',
          'a',
          'synth',
          'render',
          'vidRecorder',
        ]),
      );
    });
  });
});
