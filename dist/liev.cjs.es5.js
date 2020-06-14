'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var isString = function isString(variable) {
  return typeof variable === 'string';
};
var isFunction = function isFunction(variable) {
  return typeof variable === 'function';
};
var isElement = function isElement(variable) {
  return variable instanceof HTMLElement;
};
var getPassive = function getPassive(passive, callback) {
  return passive === undefined ? !callback.toString().includes('.preventDefault()') : passive;
};
var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      supportsPassive = true;
    }
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


var callbacks = new WeakMap();

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

var off = function off(type, selector, callback) {
  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      once = _ref.once,
      _ref$element = _ref.element,
      element = _ref$element === void 0 ? document.documentElement : _ref$element,
      passive = _ref.passive;

  if (!isString(type) || !isString(selector) || !isFunction(callback) || !isElement(element)) {
    console.warn("couldn't detach listener.");
    return false;
  }

  var passiveListener = getPassive(passive, callback);
  var eventsOnElement = callbacks.get(element);
  if (!eventsOnElement) return false;
  var eventsOnElementType = eventsOnElement[type];
  if (!eventsOnElementType) return false;
  var eventsOnElementTypePassive = eventsOnElementType[passiveListener];
  if (!eventsOnElementTypePassive) return false;
  var eventIndex = eventsOnElementTypePassive.findIndex(function (event) {
    return event.selector === selector && event.callback === callback && event.once === once;
  });
  if (eventIndex === -1) return false;

  if (eventsOnElementTypePassive.length === 1) {
    element.removeEventListener(type, eventsOnElementTypePassive.handler, {
      passive: passiveListener
    });
    delete eventsOnElementType[passiveListener];
    return true;
  }

  eventsOnElementTypePassive.splice(eventIndex, 1);
  return true;
};

var createEventHandler = function createEventHandler(element, type, passive) {
  return function (event) {
    callbacks.get(element)[type][passive].forEach(function (_ref) {
      var selector = _ref.selector,
          callback = _ref.callback,
          once = _ref.once;
      var target = selector ? event.target.closest(selector) : event.target;
      if (!target) return;

      if (passive && (!supportsPassive || event.defaultPrevented)) {
        event.preventDefault = function () {};
      }

      callback(target, event);

      if (once) {
        off(type, selector, callback, {
          once: once,
          element: element,
          passive: passive
        });
      }
    });
  };
};

var addListener = function addListener(element, type, passive) {
  var handler = createEventHandler(element, type, passive);
  callbacks.get(element)[type][passive].handler = handler;
  element.addEventListener(type, handler, {
    passive: passive
  });
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


var on = function on(type, selector, callback) {
  var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      once = _ref2.once,
      _ref2$element = _ref2.element,
      element = _ref2$element === void 0 ? document.documentElement : _ref2$element,
      passive = _ref2.passive;

  if (!isString(type) || !isString(selector) || !isFunction(callback) || !isElement(element)) {
    console.warn("couldn't attach listener.");
    return false;
  }

  var passiveListener = getPassive(passive, callback);

  var event = _objectSpread2({
    selector: selector,
    callback: callback
  }, once && {
    once: once
  });

  var eventsOnElement = callbacks.get(element);

  if (!eventsOnElement) {
    callbacks.set(element, _defineProperty({}, type, _defineProperty({}, passiveListener, [event])));
    addListener(element, type, passiveListener);
    return true;
  }

  var eventsOnElementType = eventsOnElement[type];

  if (!eventsOnElementType) {
    eventsOnElement[type] = _defineProperty({}, passiveListener, [event]);
    addListener(element, type, passiveListener);
    return true;
  }

  var eventsOnElementTypePassive = eventsOnElementType[passiveListener];

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

var emit = function emit(event) {
  var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.documentElement;
  var detail = arguments.length > 2 ? arguments[2] : undefined;

  if (!isElement(element) || !isString(event)) {
    return false;
  }

  element.dispatchEvent(new CustomEvent(event, {
    bubbles: true,
    cancelable: true,
    detail: detail
  }));
  return true;
};

exports.emit = emit;
exports.off = off;
exports.on = on;
