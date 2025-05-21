# eslint-plugin-guardrails

> A minimal ESLint plugin to enforce alias-based modular boundaries and block circular dependencies in TypeScript projects.

## 🚀 Why Use This?

Large projects tend to suffer from:

- ❌ Relative path soup like `../../utils`
- ❌ Leaky internal imports between modules
- ❌ `index.ts`-driven circular dependencies

This plugin enforces clear, safe module boundaries using a small, configurable ESLint setup.

Built on top of [import/no-internal-modules](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-internal-modules.md) and [no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports)

## 🔍 What It Does

- ✅ Prevents internal index imports like `../index` or `..`
- ✅ Allows aliased imports between modules (`@/components` < `@/store` )
- ✅ Enforces direct file imports within a module
- ✅ Walks your filesystem to block nested `index.ts` misuse
- ✅ Optionally: Prevent messy upwards directory imports `../../../helper.ts` while still ensuring you don't import from an index.

## 🚀 Installation

```bash
pnpm i eslint-plugin-guardrails -D
```

## 🧱 Setup

```ts
// eslint.config.js (ESLint v9+ with flat config)
import importPlugin from 'eslint-plugin-import';
import { configs as guardrails } from 'eslint-plugin-guardrails';

export default [
  importPlugin.flatConfigs.recommended,
  ...guardrails.recommended(['components', 'hooks', 'store', 'lib'], {
    staticUpwardPathDepth: 3,
    getAlias: (dirName) => `~/${dirname}`,
  }),
];
```

## 📦 Example

Given the aliases `@/components`, `@/pages` and the folder structure:

<pre lang="markdown">
src
├── components
│   ├── header.tsx
│   └── ui
│       ├── button.tsx
│       └── index.ts
└── pages
    └── home.tsx
</pre>

and the config:

```ts
export default [
  importPlugin.flatConfigs.recommended,
  ...guardrails.recommended(['components', 'pages'], {
    getAlias: (dirName) => `@/${dirname}`,
  }),
];
```

### Internal module

```ts
// src/components/header.tsx

// ❌ Not allowed
import { Button } from '@/components';
import { Button } from '@/components/ui';
import { Button } from '@/components/ui/index';
import { Button } from '@/components/index';
import { Button } from '.';
import { Button } from './ui';
import { Button } from './ui/index';
import { Button } from './index';
// ❌ Deep upwards imports are optionally not allowed
import { Button } from '../../ui/button';

// ✅ Allowed
import { Button } from '@/components/ui/button';
import { Button } from './ui/button';

// ✅ Allowed from other modules
import { Button } from '@/components/ui';
```

### External module

```ts
// src/pages/home.tsx

// ❌ Not allowed
import { Header } from '@/components/header';
import { Header } from '../components/header';
import { Header } from '../components'; // Must be aliased

// ✅ Allowed
import { Header } from '@/components'; // Each module must export what should be exposed
```

## 🛠️ Options

You can customize the plugin by passing an options object:

```ts
guardrails.recommended(directories, {
  sourceDirectory: 'src', // Root source folder (default: 'src')
  baseUrl: '.', // Base path for resolving aliases, relative to your eslint.config.js (default: '.')
  staticUpwardPathDepth: 3, // How many levels of '../index' to block. This depends on how many nested folders you tend to have in your project. (default: 3)
  getAlias: (dir) => `@/${dir}`, // Optional alias generator function
});
```

## 🧠 Why It Works

Circular dependencies often form when:

- Modules re-export too much from `index.ts`
- Other modules import from that `index.ts`
- Those imports come back full circle

This plugin is not a silver bullet, but helps to stops the cycle by enforcing:

- Alias-only imports between modules
- No relative or index imports within a module
- Intentional, shallow entry-points only
- Developers to think about file structure and what should be imported/exported

## 🔧 Features

- Supports flat ESLint config (v9+)
- Compatible with path aliases like `@/`
- No tagging, metadata, or annotations
- Works with file-system structure dynamically, you can have nested index files as much as you like, the plugin will find them

## 📘 Philosophy

Unlike `eslint-plugin-boundaries`, this plugin is:

- 🎛️ More suited to small/mid size projects
- 💡 Focused on circular import prevention
- 🧩 Lightweight

---

© MIT — Built to help teams ship safe TypeScript.
