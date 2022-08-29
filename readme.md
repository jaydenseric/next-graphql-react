![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# next-graphql-react

A [`graphql-react`](https://npm.im/graphql-react) integration for [Next.js](https://nextjs.org).

## Installation

Within an existing [Next.js](https://nextjs.org) project, to install [`next-graphql-react`](https://npm.im/next-graphql-react) and its [`graphql-react`](https://npm.im/graphql-react) peer dependency with [npm](https://npmjs.com/get-npm), run:

```sh
npm install next-graphql-react graphql-react
```

Setup the [Next.js custom `App`](https://nextjs.org/docs/advanced-features/custom-app) module:

- Polyfill the [required globals](https://github.com/jaydenseric/graphql-react#requirements).
- Decorate the default export with the function [`withGraphQLReact`](./withGraphQLReact.mjs).

Then [React](https://reactjs.org) hooks imported from [`graphql-react`](https://npm.im/graphql-react) can be used within the [Next.js](https://nextjs.org) project pages and components.

## Requirements

Supported runtime environments:

- [Node.js](https://nodejs.org) versions `^14.17.0 || ^16.0.0 || >= 18.0.0`.
- Browsers matching the [Browserslist](https://browsersl.ist) query [`> 0.5%, not OperaMini all, not dead`](https://browsersl.ist/?q=%3E+0.5%25%2C+not+OperaMini+all%2C+not+dead).

Projects must configure [TypeScript](https://typescriptlang.org) to use types from the ECMAScript modules that have a `// @ts-check` comment:

- [`compilerOptions.allowJs`](https://typescriptlang.org/tsconfig#allowJs) should be `true`.
- [`compilerOptions.maxNodeModuleJsDepth`](https://typescriptlang.org/tsconfig#maxNodeModuleJsDepth) should be reasonably large, e.g. `10`.
- [`compilerOptions.module`](https://typescriptlang.org/tsconfig#module) should be `"node16"` or `"nodenext"`.

## Exports

The [npm](https://npmjs.com) package [`next-graphql-react`](https://npm.im/next-graphql-react) features [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design). It doesn’t have a main index module, so use deep imports from the ECMAScript modules that are exported via the [`package.json`](./package.json) field [`exports`](https://nodejs.org/api/packages.html#exports):

- [`withGraphQLReact.mjs`](./withGraphQLReact.mjs)
