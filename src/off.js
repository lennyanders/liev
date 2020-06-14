import {
  isString,
  isFunction,
  isElement,
  callbacks,
  getPassive,
} from './shared.js';

/**
 * Removes a listener that was added through the "on" method
 * @param {String} type The type that was used on the "on" method
 * @param {String} selector The selector that was used on the "on" method
 * @param {EventHandler} callback The function that was used on the "on" method
 * @param {Object} options
 * @param {Boolean} [options.once=false] The value that was used on the "on" method
 * @param {HTMLElement} [options.element=document.documentElement] The element that was used on the "on" method
 * @param {Boolean} [options.passive] The value that was used on the "on" method
 * @returns {Boolean} `true` if removed, `false` if done nothing
 */
export const off = (
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
    console.warn("couldn't detach listener.");
    return false;
  }

  const passiveListener = getPassive(passive, callback);

  const eventsOnElement = callbacks.get(element);
  if (!eventsOnElement) return false;

  const eventsOnElementType = eventsOnElement[type];
  if (!eventsOnElementType) return false;

  const eventsOnElementTypePassive = eventsOnElementType[passiveListener];
  if (!eventsOnElementTypePassive) return false;

  const eventIndex = eventsOnElementTypePassive.findIndex(
    (event) =>
      event.selector === selector &&
      event.callback === callback &&
      event.once === once,
  );
  if (eventIndex === -1) return false;

  if (eventsOnElementTypePassive.length === 1) {
    element.removeEventListener(type, eventsOnElementTypePassive.handler, {
      passive: passiveListener,
    });
    delete eventsOnElementType[passiveListener];
    return true;
  }

  eventsOnElementTypePassive.splice(eventIndex, 1);
  return true;
};
