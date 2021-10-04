declare type OnTick = (dt: number) => void;
export declare class Loop {
    #private;
    constructor(fn: OnTick);
    start: () => this;
    stop: () => this;
    toggle: () => this;
    tick: () => this;
}
export {};
