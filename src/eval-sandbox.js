"use strict";
// handles code evaluation and attaching relevant objects to global and evaluation contexts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sandbox_1 = __importDefault(require("./lib/sandbox"));
class EvalSandbox {
    constructor(parent, makeGlobal, userProps = []) {
        this.makeGlobal = makeGlobal;
        this.sandbox = (0, sandbox_1.default)(parent);
        this.parent = parent;
        var properties = Object.keys(parent);
        properties.forEach((property) => this.add(property));
        this.userProps = userProps;
    }
    add(name) {
        if (this.makeGlobal)
            window[name] = this.parent[name];
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
        }
        else {
            // pass
        }
    }
    eval(code) {
        this.sandbox.eval(code);
    }
}
exports.default = EvalSandbox;
