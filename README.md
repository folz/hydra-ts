# `hydra-ts`

`hydra-ts` is a fork of [ojack/hydra-synth][1] in typescript, focusing on interoperability with other projects. It
seeks to be fully compatible with the original's end-user syntax (`osc().out()`) while rewriting much of the internal
implementation to make it easier to use as a library.

This is still a work in progress, so you will need to read the source for this to be of much use right now. Star the
repo for updates, new releases, and expanded documentation as these come out.

## Installation

```shell
# yarn
yarn add hydra-ts
```

```shell
# npm
npm install -S hydra-ts
```

## Documentation

For now, refer to [`hydra-synth`'s documentation](https://github.com/ojack/hydra-synth#readme).

[1]: https://github.com/ojack/hydra-synth
[2]: https://github.com/ojack/hydra

## Background

hydra-synth is a fantastically designed visual synth and shader compiler that I've wanted to use in a variety of other
projects. However, I've found that its implementation is tightly coupled to [ojack/hydra][2], the online editor created
to showcase hydra-synth. I've also found that it generally assumes a single running instance and a modifiable global
environment.

These things have caused unexpected behavior for me when I used hydra-synth outside of hydra-the-editor, or in multiple
places on the same page where I wanted each place to be self-contained from the others. While the hydra community has
shared workarounds to many of these behaviors, I wanted to create a fork which directly fixed root causes so that
workarounds are no longer needed.

To address these, hydra-ts has rewritten internals to avoid globals and mutable state, removed non-shader-compilation
features present in the original (such as audio analysis), and modified the public API to prefer referential equality
over named lookup.
