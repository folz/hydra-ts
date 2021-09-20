const { DummyOutput } = require('./lib/util');

const Synth = require('../hydra-synth');

describe.skip('Synth', function () {
  it('Sets the seq prototype on Array', () => {
    expect(Array.prototype).toEqual(expect.arrayContaining('fast'));

    expect(Array.prototype.fast).toBeInstanceOf('function');
  });

  it('Contains all transforms', () => {
    const transforms = require('../src/glsl/glsl-functions');
    const srcNames = Object.entries(transforms)
      .filter(([, transform]) => transform.type === 'src')
      .map(([name]) => name);

    const events = [];
    const dummyOutput = new DummyOutput();
    const synth = new Synth(dummyOutput, {}, (e) => events.push(e));

    expect(synth.generators).toEqual(expect.arrayContaining(srcNames));

    expect(events.filter(({ type }) => type === 'add').map(({ method }) => method)).toEqual(srcNames);
  });

  it('Can be extended', () => {
    const transforms = require('../src/glsl/glsl-functions');
    const srcNames = Object.entries(transforms)
      .filter(([, transform]) => transform.type === 'src')
      .map(([name]) => name);

    const events = [];
    const dummyOutput = new DummyOutput();
    const synth = new Synth(dummyOutput, 'invalid', (e) => events.push(e));

    expect(synth.generators).toEqual(expect.arrayContaining(srcNames));

    expect(
      events.filter(({ type }) => type === 'add').map(({ method }) => method)
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
      synth.extendTransforms = ext;

      events.length = 0;
      synth.init();

      expect(
        events.filter(({ type }) => type === 'remove').map(({ method }) => method)
      ).toEqual(srcNames);

      expect(
        events.filter(({ type }) => type === 'add').map(({ method }) => method)
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
    const dummyOutput = new DummyOutput();
    const synth = new Synth(dummyOutput);

    expect(() => {
      synth.generators.solid().repeatX().out(dummyOutput);
    }).not.toThrow();
  });

  it('Sets up uniforms properly', () => {
    const dummyOutput = new DummyOutput();
    const synth = new Synth(dummyOutput);

    expect(() => {
      synth.generators
        .solid(0, () => 1, 2)
        .repeatX(() => 3)
        .out(dummyOutput);
    }).not.toThrow();

    expect(dummyOutput.passes).toHaveLength(1);
    expect(dummyOutput.passes[0]).toHaveLength(1);

    const pass0 = dummyOutput.passes[0][0];
    expect(pass0).toEqual(expect.arrayContaining(['uniforms', 'frag']));
    expect(pass0.uniforms).toBeInstanceOf('object');

    expect(Object.keys(pass0.uniforms)).toHaveLength(2);
  });
});
