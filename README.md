# `hydra-ts`

`hydra-ts` is an opinionated fork of [ojack/hydra-synth](https://github.com/ojack/hydra-synth) which seeks to improve
how it can be used within other javascript and typescript projects, while maintaining compatibility with the original
library's end-user syntax.

So far, this has involved rewriting internals to avoid globals and mutable state, trimming the scope of the library to
only focus on shader chaining, modifying the public API to more closely follow modern library design practices (the
opinionated part), and converting it to typescript.

This is highly work-in-progress, so you will need to read the source for this to be of much use **right now**. Star the
project for updates, new releases, and improved documentation as these come out.

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
