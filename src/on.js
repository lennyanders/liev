import { isString, isFunction, isElement, callbacks } from './shared.js';
import { off } from './off.js';

const createEventHandler = (element, type) => (event) => {
  callbacks.get(element)[type].forEach(({ selector, callback, once }) => {
    const target = selector ? event.target.closest(selector) : event.target;
    if (!target) return;

    callback(target, event);

    if (once) {
      off(type, selector, callback, { once, element });
    }
  });
};

const addListener = (element, type) => {
  const handler = createEventHandler(element, type);
  callbacks.get(element)[type].handler = handler;
  element.addEventListener(type, handler);
};

/**
 * Adds a listener
 * @param {String} type A case-sensitive string representing the event [type](https://developer.mozilla.org/en-US/docs/Web/Events) to listen for
 * @param {String} selector A string containing one or more selectors to match, use an empty string to match everything
 * @param {EventHandler} callback A function that gets executed when an event of the specified type occurs
 * @param {Object} options
 * @param {Boolean} [options.once=false] whether a listener should only be executed once or not
 * @param {HTMLElement} [options.element=document.documentElement] the parent element to that the listener is attached
 * @returns {Boolean} `true` if added, `false` if done nothing
 */
export const on = (
  type,
  selector,
  callback,
  { once, element = document.documentElement } = {},
) => {
  if (
    !isString(type) ||
    !isString(selector) ||
    !isFunction(callback) ||
    !isElement(element)
  ) {
    console.warn("couldn't attach listener.");
    return false;
  }

  const event = {
    selector,
    callback,
    ...(once && { once }),
  };

  const eventsOnElement = callbacks.get(element);
  if (!eventsOnElement) {
    callbacks.set(element, { [type]: [event] });
    addListener(element, type);
    return true;
  }

  const eventsOnElementOfType = eventsOnElement[type];
  if (!eventsOnElementOfType) {
    eventsOnElement[type] = [event];
    addListener(element, type);
    return true;
  }

  eventsOnElementOfType.push(event);
  return true;
};
