// WIP utils for working with arrays
// Possibly should be integrated with lfo extension, etc.
// to do: transform time rather than array values, similar to working with coordinates in hydra

import easing from './easing-functions';

const map = (num: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

type Easing = keyof typeof easing;

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

export default {
  init: () => {
    Array.prototype.fast = function (speed = 1) {
      this._speed = speed;
      return this;
    };

    Array.prototype.smooth = function (smooth = 1) {
      this._smooth = smooth;
      return this;
    };

    Array.prototype.ease = function (ease = 'linear') {
      if (typeof ease == 'function') {
        this._smooth = 1;
        this._ease = ease;
      } else if (easing[ease]) {
        this._smooth = 1;
        this._ease = easing[ease];
      }
      return this;
    };

    Array.prototype.offset = function (offset = 0.5) {
      this._offset = offset % 1.0;
      return this;
    };

    Array.prototype.fit = function (low = 0, high = 1) {
      let lowest = Math.min(...this);
      let highest = Math.max(...this);
      const newArr = this.map((num) => map(num, lowest, highest, low, high));
      newArr._speed = this._speed;
      newArr._smooth = this._smooth;
      newArr._ease = this._ease;
      return newArr;
    };
  },

  getValue:
    (arr = []) =>
    ({ time, bpm }: any) => {
      let speed = arr._speed ? arr._speed : 1;
      let smooth = arr._smooth ? arr._smooth : 0;
      let index = time * speed * (bpm / 60) + (arr._offset || 0);

      if (smooth !== 0) {
        let ease = arr._ease ? arr._ease : easing['linear'];
        let _index = index - smooth / 2;
        let currValue = arr[Math.floor(_index % arr.length)];
        let nextValue = arr[Math.floor((_index + 1) % arr.length)];
        let t = Math.min((_index % 1) / smooth, 1);
        return ease(t) * (nextValue - currValue) + currValue;
      } else {
        return arr[Math.floor(index % arr.length)];
      }
    },
};
