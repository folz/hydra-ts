declare class DummyOutput {
    constructor();
    renderPasses(passes: any): void;
}
declare function prepareForHydra(): {
    dom: any;
    canvas: any;
};
declare function mockRegl(dimensions?: {
    width: number;
    height: number;
}): {
    reset: () => any;
};
declare const _default: {
    DummyOutput: typeof DummyOutput;
    prepareForHydra: typeof prepareForHydra;
    mockRegl: typeof mockRegl;
};
export default _default;
