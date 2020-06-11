/**
 * @callback EventHandler
 * @param {HTMLElement} target The element that triggered the event
 * @param {Event} event An object based on Event describing the event that has occurred
 */

import { on } from './on.js';
import { off } from './off.js';
import { emit } from './emit.js';

export { on, off, emit };
