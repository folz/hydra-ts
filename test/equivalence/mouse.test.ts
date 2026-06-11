/**
 * createMouse equivalence: the same event sequences produce the same
 * x/y/buttons/mods state as hydra-synth's mouse tracker. hydra-synth
 * attaches its tracker to window at import time; hydra-ts requires explicit
 * instantiation but tracks identically.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// @ts-ignore - untyped upstream javascript
import upstreamMouseListen from '../../node_modules/hydra-synth/src/lib/mouse.js';

import { createMouse, Mouse } from '../../src/lib/Mouse';

type Listener = (ev: unknown) => void;

function makeFakeElement() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    addEventListener(type: string, listener: Listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type: string, ev: Record<string, unknown>) {
      listeners.get(type)?.forEach((listener) => listener(ev));
    },
    listenerCount() {
      let n = 0;
      listeners.forEach((set) => (n += set.size));
      return n;
    },
  };
}

// upstream attaches extra listeners to `window` when given another element
beforeEach(() => {
  vi.stubGlobal('window', makeFakeElement());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const EVENT_SEQUENCES: Array<{
  name: string;
  events: Array<[string, Record<string, unknown>]>;
}> = [
  {
    name: 'mouse movement',
    events: [
      ['mousemove', { pageX: 10, pageY: 20, buttons: 0 }],
      ['mousemove', { pageX: 300, pageY: 5, buttons: 0 }],
    ],
  },
  {
    name: 'button press and drag',
    events: [
      ['mousedown', { pageX: 10, pageY: 20, button: 0, buttons: 1 }],
      ['mousemove', { pageX: 50, pageY: 60, buttons: 1 }],
      ['mouseup', { pageX: 50, pageY: 60, button: 0, buttons: 0 }],
    ],
  },
  {
    name: 'modifier keys',
    events: [
      [
        'keydown',
        { shiftKey: true, altKey: false, ctrlKey: false, metaKey: false },
      ],
      ['mousemove', { pageX: 7, pageY: 8, buttons: 0, shiftKey: true }],
      [
        'keyup',
        { shiftKey: false, altKey: true, ctrlKey: false, metaKey: false },
      ],
    ],
  },
  {
    name: 'leave clears button state',
    events: [
      ['mousedown', { pageX: 10, pageY: 20, button: 0, buttons: 1 }],
      ['mouseleave', { pageX: 0, pageY: 0, buttons: 0 }],
    ],
  },
  {
    name: 'blur resets everything',
    events: [
      ['mousemove', { pageX: 99, pageY: 99, buttons: 0 }],
      ['blur', {}],
    ],
  },
];

function snapshot(mouse: {
  x: number;
  y: number;
  buttons: number;
  mods: object;
}) {
  return {
    x: mouse.x,
    y: mouse.y,
    buttons: mouse.buttons,
    mods: { ...mouse.mods },
  };
}

describe('createMouse', () => {
  for (const sequence of EVENT_SEQUENCES) {
    test(`tracks '${sequence.name}' identically to upstream`, () => {
      const upstreamElement = makeFakeElement();
      const tsElement = makeFakeElement();

      // upstream treats a single argument as the callback and falls back to
      // listening on window; pass a noop callback to target the element
      const upstream = upstreamMouseListen(upstreamElement, () => {});
      const ours = createMouse(tsElement);

      for (const [type, ev] of sequence.events) {
        upstreamElement.dispatch(type, ev);
        tsElement.dispatch(type, ev);
        expect(snapshot(ours), `after ${type}`).toEqual(snapshot(upstream));
      }
    });
  }

  test('enabled=false detaches all listeners; enabled=true reattaches', () => {
    const element = makeFakeElement();
    const mouse = createMouse(element);

    expect(mouse.enabled).toBe(true);
    expect(element.listenerCount()).toBeGreaterThan(0);

    mouse.enabled = false;
    expect(element.listenerCount()).toBe(0);

    element.dispatch('mousemove', { pageX: 5, pageY: 5, buttons: 0 });
    expect(mouse.x).toBe(0);

    mouse.enabled = true;
    element.dispatch('mousemove', { pageX: 5, pageY: 6, buttons: 0 });
    expect(mouse.x).toBe(5);
    expect(mouse.y).toBe(6);
  });

  test('invokes the optional callback like upstream', () => {
    const upstreamElement = makeFakeElement();
    const tsElement = makeFakeElement();
    const upstreamCalls: unknown[][] = [];
    const tsCalls: unknown[][] = [];

    upstreamMouseListen(upstreamElement, (...args: unknown[]) =>
      upstreamCalls.push(structuredClone(args)),
    );
    createMouse(tsElement, (...args) => tsCalls.push(structuredClone(args)));

    for (const element of [upstreamElement, tsElement]) {
      element.dispatch('mousemove', { pageX: 1, pageY: 2, buttons: 0 });
      element.dispatch('mousedown', {
        pageX: 1,
        pageY: 2,
        button: 0,
        buttons: 1,
      });
    }

    expect(tsCalls).toEqual(upstreamCalls);
  });

  test('works without a window global when given an element', () => {
    vi.unstubAllGlobals();
    const element = makeFakeElement();
    const mouse: Mouse = createMouse(element);
    element.dispatch('mousemove', { pageX: 11, pageY: 12, buttons: 0 });
    expect([mouse.x, mouse.y]).toEqual([11, 12]);
  });
});
