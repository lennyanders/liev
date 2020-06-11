var liev = (function (exports) {
  'use strict';

  const isString = (variable) => typeof variable === 'string';

  const isFunction = (variable) => typeof variable === 'function';

  const isElement = (variable) => variable instanceof HTMLElement;

  const callbacks = new WeakMap();

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
  const off = (
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
   * @returns {Boolean} 'true' if added, 'false' if done nothing
   */
  const on = (
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

  return exports;

}({}));
