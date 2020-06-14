export const isString = (variable) => typeof variable === 'string';

export const isFunction = (variable) => typeof variable === 'function';

export const isElement = (variable) => variable instanceof HTMLElement;

export const getPassive = (passive, callback) => {
  return passive === undefined
    ? !callback.toString().includes('.preventDefault()')
    : passive;
};

export let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
    },
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {}

/*
 * structure of callbacks:
 *
 * callbacks: {
 *   [element]: {
 *     [eventType]: {
 *       [passive]: [event][] // passive: true || false
 *     }
 *   }
 * }
 */
export const callbacks = new WeakMap();
