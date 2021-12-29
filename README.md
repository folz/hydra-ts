# `hydra-ts`

`hydra-ts` is a fork of [ojack/hydra-synth][1] in typescript, focusing on interoperability with other projects. It
seeks to be fully compatible with the original's end-user syntax (`osc().out()`) while rewriting much of the internal
implementation to make it easier to use as a library.

## Installation

```shell
# yarn
yarn add hydra-ts
```

```shell
# npm
npm install -S hydra-ts
```

## Background

hydra-synth is a fantastically designed visual synth and shader compiler that I've wanted to use in a variety of other
projects. However, I've found that its implementation is tightly coupled to [ojack/hydra][2], the online editor created
to showcase hydra-synth. I've also found that it generally assumes a single running instance and a modifiable global
environment.

These things have caused unexpected behavior for me when I used hydra-synth outside of hydra-the-editor, or in multiple
places on the same page where I wanted each place to be self-contained from the others. Although the hydra community
has found workarounds to many of these behaviors, I wanted to create a fork which directly fixes root causes so that
workarounds are no longer needed.

To address these, hydra-ts has rewritten internals to avoid globals and mutable state, removed non-shader-compilation
features present in the original (such as audio analysis), and modified the public API to prefer referential equality
over named lookup.

## Documentation

_For general information about using Hydra, refer to [`hydra`'s documentation][2]._

#### Creating a Hydra instance:

```ts
import REGL from 'regl';
import Hydra from 'hydra-ts';

const regl = REGL(/*...*/);

const hydra = new Hydra({
  regl,
  width: 1080,
  height: 1080,
  /*
  numOutputs?: 4,
  numSources?: 4,
  precision?: 'mediump', // 'highp' | 'mediump' | 'lowp'
  */
});
```

The Hydra constructor expects a regl instance, width, and height. The width and height are the internal buffer
dimensions, not the dimensions of the canvas element. This means you can e.g. pass in double the size of the canvas
dimensions to avoid sampling/pixelation of high-resolution sketches until finally rendering back out to the canvas.

You can optionally provide a non-negative number for numOutputs and numSources, as well as a Precision value.

#### Recreating the hydra-editor global environment

```ts
import { Hydra, generators } from 'hydra-ts';

const hydra = new Hydra(/* ... */);

const { src, osc, gradient, shape, voronoi, noise } = generators;
const { sources, outputs } = hydra;

const [s0, s1, s2, s3] = sources;
const [o0, o1, o2, o3] = outputs;
const { hush, render } = hydra;
```

Generators are no longer dependent on the Hydra environment, so you can import them directly from `'hydra-ts'`;

Sources and outputs may be named when destructuring from their respective properties on the hydra instance.

Helper methods may also be destructured from the hydra instance.

#### Adding custom generator or modifier hydra functions (e.g. `setFunction`)

```ts
import {
  createGenerators,
  defaultGenerators,
  defaultModifiers,
} from 'hydra-ts';

const generators = createGenerators({
  generators: [...defaultGenerators, myGeneratorDefinition],
  modifiers: [...defaultModifiers, myModifierDefinition],
});

const { src, osc, /* ... , */ myGen } = generators;
```

Where `myGeneratorDefinition` and `myModifierDefinition` match the object you would have passed to `setFunction`.

A "generator" is a definition with `{type: 'src'}`, and a "modifier" is a definition of any other type.

#### Recreating bidirectional global changes (e.g. assigning `bpm`/`speed` globals)

This is not presently supported.

## Differences from the original hydra-synth

Presently, you must pass an output instance to `.out(o#)` - it does not infer the "default" output if none is passed.
PRs to address this are welcome.

You must also call ArrayUtils.init() once before any instance of hydra is used.

## Contributing

Contributions are welcome. In particular, contributions around tests, performance, correctness, and type safety are
very appreciated. I'm also open to contributions which help you integrate this into your own projects.

Please remember that this fork has a goal of full compatibility with the original implementation, so if you're
proposing new syntax or breaking changes, they will need to be upstreamed before being implemented here. If in doubt,
feel free to open an issue discussing the changes before starting work on them.

[1]: https://github.com/ojack/hydra-synth#readme
[2]: https://github.com/ojack/hydra#readme
