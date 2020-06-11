import { isString, isElement } from './shared.js';

/**
 * Emits an event from an element
 * @param {String} event A case-sensitive string representing the event [type](https://developer.mozilla.org/en-US/docs/Web/Events) to emit (can, or ideally should be, a custom one)
 * @param {HTMLElement} [element=document.documentElement] The element from that the event is detached
 * @param {*} [detail=null] an info to send with the event
 * @returns {Boolean} `true` if emitted, `false` if done nothing
 */
export const emit = (event, element = document.documentElement, detail) => {
  if (!isElement(element) || !isString(event)) {
    return false;
  }

  element.dispatchEvent(
    new CustomEvent(event, {
      bubbles: true,
      cancelable: true,
      detail,
    }),
  );
  return true;
};
