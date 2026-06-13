// Port of hydra-synth's lib/mouse.js + lib/mouse-event.js (in turn based on
// mikolalysenko/mouse-change and mouse-event), with one deliberate
// difference: hydra-synth attaches a module-level listener to `window` as a
// global `mouse` object. hydra-ts never attaches anything implicitly — call
// createMouse() yourself and close over the result, e.g.
//
//   const mouse = createMouse();
//   osc(() => mouse.x / 100).out(o0);
//
// Listeners can be detached with `mouse.enabled = false`.

export interface MouseMods {
  shift: boolean;
  alt: boolean;
  control: boolean;
  meta: boolean;
}

export type MouseCallback = (
  buttons: number,
  x: number,
  y: number,
  mods: MouseMods,
) => void;

interface MouseEventLike {
  buttons?: number;
  which?: number;
  button?: number;
  pageX?: number;
  pageY?: number;
  altKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

export interface MouseEventTarget {
  addEventListener(type: string, listener: (ev: any) => void): void;
  removeEventListener(type: string, listener: (ev: any) => void): void;
}

export interface Mouse {
  readonly element: MouseEventTarget;
  enabled: boolean;
  readonly buttons: number;
  readonly x: number;
  readonly y: number;
  readonly mods: MouseMods;
}

function eventButtons(ev: MouseEventLike): number {
  if (typeof ev === 'object') {
    if ('buttons' in ev && ev.buttons !== undefined) {
      return ev.buttons;
    } else if ('which' in ev && ev.which !== undefined) {
      const b = ev.which;
      if (b === 2) {
        return 4;
      } else if (b === 3) {
        return 2;
      } else if (b > 0) {
        return 1 << (b - 1);
      }
    } else if ('button' in ev && ev.button !== undefined) {
      const b = ev.button;
      if (b === 1) {
        return 4;
      } else if (b === 2) {
        return 2;
      } else if (b >= 0) {
        return 1 << b;
      }
    }
  }
  return 0;
}

function eventX(ev: MouseEventLike): number {
  if (typeof ev === 'object' && 'pageX' in ev && ev.pageX !== undefined) {
    return ev.pageX;
  }
  return 0;
}

function eventY(ev: MouseEventLike): number {
  if (typeof ev === 'object' && 'pageY' in ev && ev.pageY !== undefined) {
    return ev.pageY;
  }
  return 0;
}

export function createMouse(callback?: MouseCallback): Mouse;
export function createMouse(
  element?: MouseEventTarget,
  callback?: MouseCallback,
): Mouse;
export function createMouse(
  element?: MouseEventTarget | MouseCallback,
  callback?: MouseCallback,
): Mouse {
  // single-function-argument form: createMouse(callback) listens on window,
  // like upstream's mouseListen(callback)
  if (typeof element === 'function') {
    callback = element;
    element = undefined;
  }

  const target: MouseEventTarget =
    element ?? (window as unknown as MouseEventTarget);
  // upstream also listens on window for blur/key events when given another
  // element; do the same where a window exists
  const globalTarget: MouseEventTarget | undefined =
    typeof window !== 'undefined' && target !== (window as unknown)
      ? (window as unknown as MouseEventTarget)
      : undefined;

  let buttonState = 0;
  let x = 0;
  let y = 0;
  const mods: MouseMods = {
    shift: false,
    alt: false,
    control: false,
    meta: false,
  };
  let attached = false;

  function updateMods(ev: MouseEventLike): boolean {
    let changed = false;
    if ('altKey' in ev) {
      changed = changed || ev.altKey !== mods.alt;
      mods.alt = !!ev.altKey;
    }
    if ('shiftKey' in ev) {
      changed = changed || ev.shiftKey !== mods.shift;
      mods.shift = !!ev.shiftKey;
    }
    if ('ctrlKey' in ev) {
      changed = changed || ev.ctrlKey !== mods.control;
      mods.control = !!ev.ctrlKey;
    }
    if ('metaKey' in ev) {
      changed = changed || ev.metaKey !== mods.meta;
      mods.meta = !!ev.metaKey;
    }
    return changed;
  }

  function handleEvent(nextButtons: number, ev: MouseEventLike) {
    const nextX = eventX(ev);
    const nextY = eventY(ev);
    if ('buttons' in ev && ev.buttons !== undefined) {
      nextButtons = ev.buttons | 0;
    }
    if (
      nextButtons !== buttonState ||
      nextX !== x ||
      nextY !== y ||
      updateMods(ev)
    ) {
      buttonState = nextButtons | 0;
      x = nextX || 0;
      y = nextY || 0;
      if (callback) callback(buttonState, x, y, mods);
    }
  }

  function clearState(ev: MouseEventLike) {
    handleEvent(0, ev);
  }

  function handleBlur() {
    if (
      buttonState ||
      x ||
      y ||
      mods.shift ||
      mods.alt ||
      mods.meta ||
      mods.control
    ) {
      x = y = 0;
      buttonState = 0;
      mods.shift = mods.alt = mods.control = mods.meta = false;
      if (callback) callback(0, 0, 0, mods);
    }
  }

  function handleMods(ev: MouseEventLike) {
    if (updateMods(ev)) {
      if (callback) callback(buttonState, x, y, mods);
    }
  }

  function handleMouseMove(ev: MouseEventLike) {
    if (eventButtons(ev) === 0) {
      handleEvent(0, ev);
    } else {
      handleEvent(buttonState, ev);
    }
  }

  function handleMouseDown(ev: MouseEventLike) {
    handleEvent(buttonState | eventButtons(ev), ev);
  }

  function handleMouseUp(ev: MouseEventLike) {
    handleEvent(buttonState & ~eventButtons(ev), ev);
  }

  function attachListeners() {
    if (attached) {
      return;
    }
    attached = true;

    target.addEventListener('mousemove', handleMouseMove);
    target.addEventListener('mousedown', handleMouseDown);
    target.addEventListener('mouseup', handleMouseUp);

    target.addEventListener('mouseleave', clearState);
    target.addEventListener('mouseenter', clearState);
    target.addEventListener('mouseout', clearState);
    target.addEventListener('mouseover', clearState);

    target.addEventListener('blur', handleBlur);

    target.addEventListener('keyup', handleMods);
    target.addEventListener('keydown', handleMods);
    target.addEventListener('keypress', handleMods);

    if (globalTarget) {
      globalTarget.addEventListener('blur', handleBlur);

      globalTarget.addEventListener('keyup', handleMods);
      globalTarget.addEventListener('keydown', handleMods);
      globalTarget.addEventListener('keypress', handleMods);
    }
  }

  function detachListeners() {
    if (!attached) {
      return;
    }
    attached = false;

    target.removeEventListener('mousemove', handleMouseMove);
    target.removeEventListener('mousedown', handleMouseDown);
    target.removeEventListener('mouseup', handleMouseUp);

    target.removeEventListener('mouseleave', clearState);
    target.removeEventListener('mouseenter', clearState);
    target.removeEventListener('mouseout', clearState);
    target.removeEventListener('mouseover', clearState);

    target.removeEventListener('blur', handleBlur);

    target.removeEventListener('keyup', handleMods);
    target.removeEventListener('keydown', handleMods);
    target.removeEventListener('keypress', handleMods);

    if (globalTarget) {
      globalTarget.removeEventListener('blur', handleBlur);

      globalTarget.removeEventListener('keyup', handleMods);
      globalTarget.removeEventListener('keydown', handleMods);
      globalTarget.removeEventListener('keypress', handleMods);
    }
  }

  attachListeners();

  return {
    element: target,
    get enabled() {
      return attached;
    },
    set enabled(f: boolean) {
      if (f) {
        attachListeners();
      } else {
        detachListeners();
      }
    },
    get buttons() {
      return buttonState;
    },
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get mods() {
      return mods;
    },
  };
}
