// handles code evaluation and attaching relevant objects to global and evaluation contexts

import { Sandbox } from './lib/Sandbox';

export class EvalSandbox {
  makeGlobal: boolean;
  parent: Record<string, any>;
  sandbox: ReturnType<typeof Sandbox>;
  userProps: string[];

  constructor(
    parent: Record<string, any>,
    makeGlobal: boolean,
    userProps: string[] = [],
  ) {
    this.makeGlobal = makeGlobal;
    this.sandbox = Sandbox(parent);
    this.parent = parent;
    const properties = Object.keys(parent);
    properties.forEach((property) => this.add(property));
    this.userProps = userProps;
  }

  add(name: string) {
    if (this.makeGlobal) {
      // @ts-ignore
      window[name] = this.parent[name];
    }
    this.sandbox.addToContext(name, `parent.${name}`);
  }

  // sets on window as well as synth object if global (not needed for objects, which can be set directly)

  set(property: string, value: number) {
    if (this.makeGlobal) {
      // @ts-ignore
      window[property] = value;
    }
    this.parent[property] = value;
  }

  tick() {
    if (this.makeGlobal) {
      this.userProps.forEach((property) => {
        // @ts-ignore
        this.parent[property] = window[property];
      });
    } else {
      // pass
    }
  }

  eval(code: string) {
    this.sandbox.eval(code);
  }
}
