define(['exports'], (function (exports) { 'use strict';

  const isString = (variable) => typeof variable === 'string';

  const isFunction = (variable) => typeof variable === 'function';

  const isElement = (variable) => variable instanceof HTMLElement;

  const getPassive = (passive, callback) => {
    return passive === undefined
      ? !callback.toString().includes('.preventDefault()')
      : passive;
  };

  let supportsPassive = false;
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
  const callbacks = new WeakMap();

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
  const off = (
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
  const on = (
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

  /**
   * Emits an event from an element
   * @param {String} event A case-sensitive string representing the event [type](https://developer.mozilla.org/en-US/docs/Web/Events) to emit (can, or ideally should be, a custom one)
   * @param {HTMLElement} [element=document.documentElement] The element from that the event is detached
   * @param {*} [detail=null] an info to send with the event
   * @returns {Boolean} `true` if emitted, `false` if done nothing
   */
  const emit = (event, element = document.documentElement, detail) => {
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

  exports.emit = emit;
  exports.off = off;
  exports.on = on;

}));
