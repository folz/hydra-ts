import easing from './easing-functions';
declare type Easing = keyof typeof easing;
declare global {
    interface Array<T> {
        _speed: number;
        _smooth: number;
        _ease: (t: number) => number;
        _offset: number;
        fast(speed: number): this;
        smooth(smooth: number): this;
        ease(ease: Easing): this;
        offset(offset: number): this;
        fit(low: number, high: number): this;
    }
}
declare const _default: {
    init: () => void;
    getValue: (arr?: never[]) => ({ time, bpm }: any) => number;
};
export default _default;
