var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Loop_ts, _Loop_running, _Loop_raf, _Loop_fn;
export class Loop {
    constructor(fn) {
        _Loop_ts.set(this, performance.now());
        _Loop_running.set(this, false);
        _Loop_raf.set(this, void 0);
        _Loop_fn.set(this, void 0);
        this.start = () => {
            if (__classPrivateFieldGet(this, _Loop_running, "f")) {
                return this;
            }
            __classPrivateFieldSet(this, _Loop_running, true, "f");
            __classPrivateFieldSet(this, _Loop_ts, performance.now(), "f");
            __classPrivateFieldSet(this, _Loop_raf, requestAnimationFrame(this.tick), "f");
            return this;
        };
        this.stop = () => {
            __classPrivateFieldSet(this, _Loop_running, false, "f");
            if (__classPrivateFieldGet(this, _Loop_raf, "f")) {
                cancelAnimationFrame(__classPrivateFieldGet(this, _Loop_raf, "f"));
            }
            __classPrivateFieldSet(this, _Loop_raf, undefined, "f");
            return this;
        };
        this.tick = () => {
            __classPrivateFieldSet(this, _Loop_raf, requestAnimationFrame(this.tick), "f");
            const time = performance.now();
            const dt = time - __classPrivateFieldGet(this, _Loop_ts, "f");
            __classPrivateFieldGet(this, _Loop_fn, "f").call(this, dt);
            __classPrivateFieldSet(this, _Loop_ts, time, "f");
            return this;
        };
        __classPrivateFieldSet(this, _Loop_fn, fn, "f");
    }
}
_Loop_ts = new WeakMap(), _Loop_running = new WeakMap(), _Loop_raf = new WeakMap(), _Loop_fn = new WeakMap();
