# TypeScript Register [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

Extension to require TypeScript files from Node. This project is an alternative to [typescript-require][typescript-require]. The main differences are:

- Dependencies are run in the same context as the parent
- Uses the TypeScript API as opposed to forking `tsc`
- Caches dependencies in `/tmp/typescript-register/:your/:path/:here`

## Examples

### foo.ts

```ts
export var foo = 3;
```

### bar.js
```js
require('typescript-register');
var foo = require('./foo');

console.log(foo.foo);
```

## Installation

Install with npm:

```
npm install typescript-register
```

## Configuration

There are three configuration options which are read from environment variables. The configuration options are read each time a module is required so you can programatically set them with: 

```js
process.env[':name'] = ':value';
```

The values are:

- `TYPESCRIPT_REGISTER_EMIT_ERROR`: Whether or not emit fatal TypeScript errors
- `TYPESCRIPT_REGISTER_USE_CACHE`: Whether or not to use previously emitted files
- `TYPESCRIPT_REGISTER_COMPILER_OPTIONS`: The JSON stringified TypeScript compiler options

## Contributing

Feel free to fork and submit pull requests for the code! Please follow the existing code as an example of style and make sure that all your code passes tests.

[npm-url]: https://www.npmjs.org/package/typesript-register
[npm-image]: http://img.shields.io/npm/v/typesript-register.svg?style=flat-square

[travis-url]: http://travis-ci.org/Asana/pspeter3/typescript-register
[travis-image]: http://img.shields.io/travis/pspeter3/typescript-register/master.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/pspeter3/typescript-register
[coveralls-image]: https://img.shields.io/coveralls/pspeter3/typescript-register/master.svg?style=flat-square

[typescript-require]: https://github.com/eknkc/typescript-require
