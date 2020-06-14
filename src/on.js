import {
  isString,
  isFunction,
  isElement,
  callbacks,
  getPassive,
  supportsPassive,
} from './shared.js';
import { off } from './off.js';

const createEventHandler = (element, type, passive) => (event) => {
  callbacks
    .get(element)
    [type][passive].forEach(({ selector, callback, once }) => {
      const target = selector ? event.target.closest(selector) : event.target;
      if (!target) return;

      if (passive && (!supportsPassive || event.defaultPrevented)) {
        event.preventDefault = () => {};
      }

      callback(target, event);

      if (once) {
        off(type, selector, callback, { once, element, passive });
      }
    });
};

const addListener = (element, type, passive) => {
  const handler = createEventHandler(element, type, passive);
  callbacks.get(element)[type][passive].handler = handler;
  element.addEventListener(type, handler, { passive });
};

/**
 * Adds a listener
 * @param {String} type A case-sensitive string representing the event [type](https://developer.mozilla.org/en-US/docs/Web/Events) to listen for
 * @param {String} selector A string containing one or more selectors to match, use an empty string to match everything
 * @param {EventHandler} callback A function that gets executed when an event of the specified type occurs
 * @param {Object} options
 * @param {Boolean} [options.once=false] whether a listener should only be executed once or not
 * @param {HTMLElement} [options.element=document.documentElement] the parent element to that the listener is attached
 * @param {Boolean} [options.passive] Whether a listener should be passive or not, looks per default into a stringified version of your callback to decide based on your code if it should be passive or not
 * @returns {Boolean} `true` if added, `false` if done nothing
 */
export const on = (
  type,
  selector,
  callback,
  { once, element = document.documentElement, passive } = {},
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

  const passiveListener = getPassive(passive, callback);

  const event = {
    selector,
    callback,
    ...(once && { once }),
  };

  const eventsOnElement = callbacks.get(element);
  if (!eventsOnElement) {
    callbacks.set(element, { [type]: { [passiveListener]: [event] } });
    addListener(element, type, passiveListener);
    return true;
  }

  const eventsOnElementType = eventsOnElement[type];
  if (!eventsOnElementType) {
    eventsOnElement[type] = { [passiveListener]: [event] };
    addListener(element, type, passiveListener);
    return true;
  }

  const eventsOnElementTypePassive = eventsOnElementType[passiveListener];
  if (!eventsOnElementTypePassive) {
    eventsOnElementType[passiveListener] = [event];
    addListener(element, type, passiveListener);
    return true;
  }

  eventsOnElementTypePassive.push(event);
  return true;
};
