// handles code evaluation and attaching relevant objects to global and evaluation contexts
import { Sandbox } from './lib/sandbox';
export class EvalSandbox {
    constructor(parent, makeGlobal, userProps = []) {
        this.makeGlobal = makeGlobal;
        this.sandbox = Sandbox(parent);
        this.parent = parent;
        const properties = Object.keys(parent);
        properties.forEach((property) => this.add(property));
        this.userProps = userProps;
    }
    add(name) {
        if (this.makeGlobal) {
            // @ts-ignore
            window[name] = this.parent[name];
        }
        this.sandbox.addToContext(name, `parent.${name}`);
    }
    // sets on window as well as synth object if global (not needed for objects, which can be set directly)
    set(property, value) {
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
            //  this.parent.speed = window.speed
        }
        else {
            // pass
        }
    }
    eval(code) {
        this.sandbox.eval(code);
    }
}
