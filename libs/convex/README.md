# convex

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build convex` to build the library.

## project.json

```
"targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/convex",
        "main": "libs/convex/src/index.ts",
        "tsConfig": "libs/convex/tsconfig.lib.json",
        "assets": ["libs/convex/*.md"]
      }
    },
    // NEW: one-time configure (create new Convex project + dev deployment)
    "configure:new": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": ".",
        "command": "pnpm exec convex dev --once --configure=new"
      }
    },

    // NEW: link to an existing Convex project (if you already created one)
    "configure:existing": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": ".",
        "command": "pnpm exec convex dev --once --configure=existing"
      }
    },

    // NEW: normal dev (long-running)
    "dev": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": ".",
        "command": "pnpm exec convex dev"
      }
    },

    // NEW: deploy to Convex cloud
    "deploy": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": ".",
        "command": "pnpm exec convex deploy"
      }
    },

    // NEW: type-check only the Convex functions (no emit)
    "functions:check": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm exec tsc -p libs/convex/src/lib/tsconfig.json --noEmit"
      }
    }
  }
```
