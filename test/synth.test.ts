import { HydraRenderer as Synth } from '../HydraRenderer';

import { transforms } from '../src/glsl/transformDefinitions';
import REGL from 'regl';
import gl from 'gl';

describe.skip('Synth', function () {
  let regl;

  beforeEach(function () {
    regl = REGL(gl(800, 600));
  });

  it('Sets the seq prototype on Array', () => {
    expect(Array.prototype).toEqual(expect.arrayContaining(['fast']));

    expect(Array.prototype.fast).toBeInstanceOf('function');
  });

  it('Contains all transforms', () => {
    const srcNames = Object.entries(transforms)
      .filter(([, transform]) => transform.type === 'src')
      .map(([name]) => name);

    const events = [];
    const synth = new Synth({ regl }, {}, (e) => events.push(e));

    expect(synth.generators).toEqual(expect.arrayContaining(srcNames));

    expect(
      events.filter(({ type }) => type === 'add').map(({ method }) => method),
    ).toEqual(srcNames);
  });

  it('Can be extended', () => {
    const srcNames = Object.entries(transforms)
      .filter(([, transform]) => transform.type === 'src')
      .map(([name]) => name);

    const events = [];
    const synth = new Synth({ regl }, 'invalid', (e) => events.push(e));

    expect(synth.generators).toEqual(expect.arrayContaining(srcNames));

    expect(
      events.filter(({ type }) => type === 'add').map(({ method }) => method),
    ).toEqual(srcNames);

    [
      {
        foo: {
          type: 'src',
          inputs: [],
          glsl: '<foo>',
        },
      },
      [
        {
          name: 'foo',
          type: 'src',
          inputs: [],
          glsl: '<foo>',
        },
      ],
    ].forEach((ext) => {
      events.length = 0;
      synth.init();

      expect(
        events
          .filter(({ type }) => type === 'remove')
          .map(({ method }) => method),
      ).toEqual(srcNames);

      expect(
        events.filter(({ type }) => type === 'add').map(({ method }) => method),
      ).toEqual(expect.arrayContaining([...srcNames, 'foo']));
    });

    synth.setFunction('bar', {
      type: 'src',
      inputs: [],
      glsl: '<bar>',
    });

    expect(synth.generators).toEqual(expect.arrayContaining('bar'));
  });

  it('Can create function chains', () => {
    const synth = new Synth({ regl });

    expect(() => {
      synth.generators.solid().repeatX().out();
    }).not.toThrow();
  });

  it.skip('Sets up uniforms properly', () => {
    const dummyOutput = { passes: [[{ uniforms: [] }]] };
    const synth = new Synth({ regl });

    expect(() => {
      synth.generators
        .solid(0, () => 1, 2)
        .repeatX(() => 3)
        .out();
    }).not.toThrow();

    expect(dummyOutput.passes).toHaveLength(1);
    expect(dummyOutput.passes[0]).toHaveLength(1);

    const pass0 = dummyOutput.passes[0][0];
    expect(pass0).toEqual(expect.arrayContaining(['uniforms', 'frag']));
    expect(pass0.uniforms).toBeInstanceOf('object');

    expect(Object.keys(pass0.uniforms)).toHaveLength(2);
  });
});
