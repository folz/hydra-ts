// handles code evaluation and attaching relevant objects to global and evaluation contexts

import Sandbox from './lib/sandbox';

export default class EvalSandbox {
  makeGlobal: boolean;
  parent: any;
  sandbox: ReturnType<typeof Sandbox>;
  userProps: any;

  constructor(parent, makeGlobal: boolean, userProps: string[] = []) {
    this.makeGlobal = makeGlobal;
    this.sandbox = Sandbox(parent);
    this.parent = parent;
    var properties = Object.keys(parent);
    properties.forEach((property) => this.add(property));
    this.userProps = userProps;
  }

  add(name: string) {
    if (this.makeGlobal) window[name] = this.parent[name];
    this.sandbox.addToContext(name, `parent.${name}`);
  }

  // sets on window as well as synth object if global (not needed for objects, which can be set directly)

  set(property, value) {
    if (this.makeGlobal) {
      window[property] = value;
    }
    this.parent[property] = value;
  }

  tick() {
    if (this.makeGlobal) {
      this.userProps.forEach((property) => {
        this.parent[property] = window[property];
      });
      //  this.parent.speed = window.speed
    } else {
      // pass
    }
  }

  eval(code: string) {
    this.sandbox.eval(code);
  }
}
