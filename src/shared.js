export const isString = (variable) => typeof variable === 'string';

export const isFunction = (variable) => typeof variable === 'function';

export const isElement = (variable) => variable instanceof HTMLElement;

export const callbacks = new WeakMap();
