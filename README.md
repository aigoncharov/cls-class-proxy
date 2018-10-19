# cls-class-proxy [![Build Status](https://travis-ci.org/keenondrums/cls-class-proxy.svg?branch=master)](https://travis-ci.org/keenondrums/cls-class-proxy)

A Proxy-based lightweight library to add [Continuation-Local Storage aka (CLS)](https://github.com/jeff-lewis/cls-hooked) to class contructor, method calls, getters and setters.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Quick start](#quick-start)
  - [Decorator-based](#decorator-based)
  - [Non-decorator based](#non-decorator-based)
- [Options](#options)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

1. Install libraries

   ```
   npm i cls-class-proxy cls-hooked
   ```

2. Install typings if you use typescript

   ```
   npm i -D @types/cls-hooked
   ```

## Quick start

### Decorator-based

1. Set in your tsconfig.json

   ```json
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true
   ```

1. In your code

   ```ts
   import { getNamespace } from 'cls-hooked'
   import { proxify, CLS_CLASS_PROXY_NAMESPACE_NAME } from 'cls-class-proxy'

   @proxify()
   class Example {
     constructor() {
       const namespace = getNamespace(CLS_CLASS_PROXY_NAMESPACE_NAME)
       // At this point the namespace has an active contex (namspace.active returns the context)
       // You can set and get data for the context
     }
     method1() {
       const namespace = getNamespace(CLS_CLASS_PROXY_NAMESPACE_NAME)
       // At this point the namespace has an active contex (namspace.active returns the context)
       // You can set and get data for the context
     }
     get prop1() {
       const namespace = getNamespace(CLS_CLASS_PROXY_NAMESPACE_NAME)
       // At this point the namespace has an active contex (namspace.active returns the context)
       // You can set and get data for the context
     }
     set prop2() {
       const namespace = getNamespace(CLS_CLASS_PROXY_NAMESPACE_NAME)
       // At this point the namespace has an active contex (namspace.active returns the context)
       // You can set and get data for the context
     }
   }
   ```

### Non-decorator based

```ts
import { getNamespace } from 'cls-hooked'
import { proxify, CLS_CLASS_PROXY_NAMESPACE_NAME } from 'cls-class-proxy'

class Example {}
const ExampleProxified = proxify()(Example)
```

## Options

`proxify` accepts an optional object with options:

- `namespace`: string|symbol - custom namespace name to use instead of default CLS_CLASS_PROXY_NAMESPACE_NAME
- `cache`: boolean - to wrap method, getter and setter calls in a CLS context `cls-class-proxy` recursively looks up
  [property descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) on a target object and its prototype chain. To avoid doing that for every call `cls-class-proxy` caches property descriptors in a Map. It's enabled by default.
