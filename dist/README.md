# Explanation of Build Files

- Files with `.min` in it:

  > are the minified/production version of the file that has the exact same name, except that `.min` is missing.

- Files with `.es5` in it:

  > are the [es5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) version of the file that has the exact same name, except that `.es5` is missing.

  These export are usabale in IE 11, and other older Browsers, only a polyfill for [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill) is needed.

- Files with `.amd` in it:

  > are the [Asynchronous module definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition) export of the Liev.

- Files with `.cjs` in it:

  > are the [CommonJS](https://en.wikipedia.org/wiki/CommonJS) export of the Liev.

  Good for, espacially older, Node versions (When using [require](https://requirejs.org/docs/node.html)).

- Files with `.es` in it:

  > are the [ECMAScript Modules](https://nodejs.org/api/esm.html) export of the Liev.

  Good for usage in modern browsers and for bundling with something like [rollup](https://rollupjs.org/guide/en/), [parcel](https://parceljs.org/) or [webpack](https://webpack.js.org/).

- `liev{.min}.js`

  > are the [Immediately Invoked Function Expression](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) export of Liev.

  Good when you don't or can't use a module system or an Bundler and include Liev via an HTML script tag.
