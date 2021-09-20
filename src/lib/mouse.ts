// based on https://github.com/mikolalysenko/mouse-change

import mouse from './mouse-event';

type Callback = (
  buttonState: number,
  x: number,
  y: number,
  mods: { shift: boolean; alt: boolean; control: boolean; meta: boolean }
) => void;

type Return = {
  element: HTMLElement | Window;
};

export default function mouseListen(callback?: Callback): any;
export default function mouseListen(element?: HTMLElement | Window, callback?: Callback): any;

export default function mouseListen(
  element?: HTMLElement | Window | Callback,
  callback?: Callback
) {
  if (!callback) {
    callback = element as Callback;
    element = window;
  }

  var buttonState = 0;
  var x = 0;
  var y = 0;
  var mods = {
    shift: false,
    alt: false,
    control: false,
    meta: false,
  };
  var attached = false;

  // @ts-ignore
  function updateMods(ev) {
    var changed = false;
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

  // @ts-ignore
  function handleEvent(nextButtons, ev) {
    var nextX = mouse.x(ev);
    var nextY = mouse.y(ev);
    if ('buttons' in ev) {
      nextButtons = ev.buttons | 0;
    }
    if (nextButtons !== buttonState || nextX !== x || nextY !== y || updateMods(ev)) {
      buttonState = nextButtons | 0;
      x = nextX || 0;
      y = nextY || 0;
      callback && callback(buttonState, x, y, mods);
    }
  }

  // @ts-ignore
  function clearState(ev) {
    handleEvent(0, ev);
  }

  function handleBlur() {
    if (buttonState || x || y || mods.shift || mods.alt || mods.meta || mods.control) {
      x = y = 0;
      buttonState = 0;
      mods.shift = mods.alt = mods.control = mods.meta = false;
      callback && callback(0, 0, 0, mods);
    }
  }

  // @ts-ignore
  function handleMods(ev) {
    if (updateMods(ev)) {
      callback && callback(buttonState, x, y, mods);
    }
  }

  // @ts-ignore
  function handleMouseMove(ev) {
    if (mouse.buttons(ev) === 0) {
      handleEvent(0, ev);
    } else {
      handleEvent(buttonState, ev);
    }
  }

  // @ts-ignore
  function handleMouseDown(ev) {
    handleEvent(buttonState | mouse.buttons(ev), ev);
  }

  // @ts-ignore
  function handleMouseUp(ev) {
    handleEvent(buttonState & ~mouse.buttons(ev), ev);
  }

  function attachListeners() {
    if (attached) {
      return;
    }
    attached = true;

    // @ts-ignore
    element.addEventListener('mousemove', handleMouseMove);

    // @ts-ignore
    element.addEventListener('mousedown', handleMouseDown);

    // @ts-ignore
    element.addEventListener('mouseup', handleMouseUp);

    // @ts-ignore
    element.addEventListener('mouseleave', clearState);
    // @ts-ignore
    element.addEventListener('mouseenter', clearState);
    // @ts-ignore
    element.addEventListener('mouseout', clearState);
    // @ts-ignore
    element.addEventListener('mouseover', clearState);

    // @ts-ignore
    element.addEventListener('blur', handleBlur);

    // @ts-ignore
    element.addEventListener('keyup', handleMods);
    // @ts-ignore
    element.addEventListener('keydown', handleMods);
    // @ts-ignore
    element.addEventListener('keypress', handleMods);

    if (element !== window) {
      window.addEventListener('blur', handleBlur);

      window.addEventListener('keyup', handleMods);
      window.addEventListener('keydown', handleMods);
      window.addEventListener('keypress', handleMods);
    }
  }

  function detachListeners() {
    if (!attached) {
      return;
    }
    attached = false;

    // @ts-ignore
    element.removeEventListener('mousemove', handleMouseMove);

    // @ts-ignore
    element.removeEventListener('mousedown', handleMouseDown);

    // @ts-ignore
    element.removeEventListener('mouseup', handleMouseUp);

    // @ts-ignore
    element.removeEventListener('mouseleave', clearState);
    // @ts-ignore
    element.removeEventListener('mouseenter', clearState);
    // @ts-ignore
    element.removeEventListener('mouseout', clearState);
    // @ts-ignore
    element.removeEventListener('mouseover', clearState);
    // @ts-ignore

    // @ts-ignore
    element.removeEventListener('blur', handleBlur);

    // @ts-ignore
    element.removeEventListener('keyup', handleMods);
    // @ts-ignore
    element.removeEventListener('keydown', handleMods);
    // @ts-ignore
    element.removeEventListener('keypress', handleMods);

    if (element !== window) {
      window.removeEventListener('blur', handleBlur);

      window.removeEventListener('keyup', handleMods);
      window.removeEventListener('keydown', handleMods);
      window.removeEventListener('keypress', handleMods);
    }
  }

  // Attach listeners
  attachListeners();

  var result = {
    element: element,
  };

  Object.defineProperties(result, {
    enabled: {
      get: function () {
        return attached;
      },
      set: function (f) {
        if (f) {
          attachListeners();
        } else {
          detachListeners();
        }
      },
      enumerable: true,
    },
    buttons: {
      get: function () {
        return buttonState;
      },
      enumerable: true,
    },
    x: {
      get: function () {
        return x;
      },
      enumerable: true,
    },
    y: {
      get: function () {
        return y;
      },
      enumerable: true,
    },
    mods: {
      get: function () {
        return mods;
      },
      enumerable: true,
    },
  });

  return result;
}
