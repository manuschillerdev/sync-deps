# sync-deps

**TLDR; Compares your lockfile with installed dependencies and triggers an installation on mismatches. Works with npm,
yarn and pnpm.**

Tired of your local dev-server not starting after you checked out a branch that has different dependencies than you previous
one? Normally you would have to manually update your dependencies. `sync-deps` can automate this step.

Based on your lockfile it automatically detects whether you use `npm`, `yarn` or `pnpm` and acts accordingly.

heavily inspired by [this gist](https://gist.github.com/jzaefferer/39bd074b5a448cace1e3fe9f7c57e2b4)!

## Usage

Install as devDependency (adds ~1MB to your `node_modules`): ` yarn add -D sync-deps`

### Option one: add as pre-hook of your dev task:
In this case sync-deps checks your dependencies before your dev server starts.

Example - in a NextJS environment:
```json
{
  "scripts": {
    "predev": "sync-deps",
    "dev": "next dev"
  }
}
```

### Option two: usage with husky on `post-checkout`
In this case sync-deps checks your dependencies, whenever you check out a different branch via `git`.

```bash
yarn add -D husky
```

```json
{
  "scripts": {
    "dev": "next",
    "sync-deps": "sync-deps"
  },
  "husky": {
    "hooks": {
      "post-checkout": "sync-deps"
    }
  }
}
```
