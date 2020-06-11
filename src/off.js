import { isString, isFunction, isElement, callbacks } from './shared.js';

/**
 * Removes a listener that was added through the "on" method
 * @param {String} type A case-sensitive string representing the event [type](https://developer.mozilla.org/en-US/docs/Web/Events) to listen for
 * @param {String} selector A string containing one or more selectors to match, use an empty string to match everything
 * @param {EventHandler} callback A function that gets executed when an event of the specified type occurs
 * @param {Object} options
 * @param {Boolean} [options.once=false] whether a listener should only be executed once or not
 * @param {HTMLElement} [options.element=document.documentElement] the parent element to that the listener is attached
 * @returns {Boolean} 'true' if removed, 'false' if done nothing
 */
export const off = (
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
    console.warn("couldn't detach listener.");
    return false;
  }

  const eventsOnElement = callbacks.get(element);
  if (!eventsOnElement) return false;

  const eventsOnElementOfType = eventsOnElement[type];
  if (!eventsOnElementOfType) return false;

  const eventIndex = eventsOnElementOfType.findIndex(
    (event) =>
      event.selector === selector &&
      event.callback === callback &&
      event.once === once,
  );
  if (eventIndex === -1) return false;

  if (eventsOnElementOfType.length === 1) {
    element.removeEventListener(type, eventsOnElementOfType.handler);
    delete eventsOnElement[type];
    return true;
  }

  eventsOnElementOfType.splice(eventIndex, 1);
  return true;
};
