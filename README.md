# bff-cnv

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A modern full-stack monorepo featuring an Angular 20 frontend, Express BFF (Backend-For-Frontend), and Convex backend with WorkOS authentication. This project demonstrates a secure architecture pattern where the Angular app communicates through a BFF layer that handles authentication, session management, and proxies requests to the Convex backend.

## Project Overview

This Nx monorepo implements a three-tier architecture:

- **Angular Frontend**: Modern Angular 20 SPA with Angular Material MD3 components, Tailwind CSS, Reactive Forms (transitioning to Signal Forms in Angular 21), and Signals
- **Express BFF**: Backend-For-Frontend layer handling JWT validation, JWKS, CSRF protection, OIDC callbacks, and sealed session management with WorkOS AuthKit
- **Convex Backend**: Real-time database and backend functions with JWT-based authentication

## Monorepo Structure

```
apps/
  ng-frontend/        # Angular 20 app (Angular Material MD3, Tailwind, Reactive/Signal Forms)
  ng-frontend-e2e/    # UI e2e Playwright tests
  ng-bff/             # Express BFF (JWT, JWKS, CSRF, OIDC callbacks)
libs/
  convex/             # Convex functions and schema
  shared-types/       # Shared TypeScript types, DTOs, and enums
```

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for version)
- pnpm package manager
- devtunnel CLI (for local OIDC development)

### Run the App Locally

Start all three services in separate terminals:

**1. Angular Frontend**

```sh
pnpm nx serve ng-frontend
```

Access at: `http://localhost:4200`

**2. Express BFF**

```sh
pnpm nx serve ng-bff
```

Running at: `http://localhost:3000`

**3. Convex Backend**

```sh
pnpm nx run convex:dev
```

**4. Create and host a dev tunnel using [devtunnel cli](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started?tabs=macos) (for OIDC callback)**

```sh
devtunnel host bff-cnv-ng-bff
```

This creates a public tunnel to your local BFF for WorkOS authentication callbacks.

### Before Committing

Always run these checks before committing:

```sh
# Check formatting
pnpm format:check

# Auto-fix formatting
pnpm format

# Lint all projects
pnpm lint

# Type check all projects
pnpm typecheck
```

## Run Tasks

View project details:

```sh
npx nx show project ng-frontend
npx nx show project ng-bff
npx nx show project convex
```

Run tasks across the monorepo:

```sh
# Run specific task
npx nx run <project>:<target>

# Run task for affected projects
npx nx affected -t build

# Run task for all projects
npx nx run-many -t test
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Architecture Highlights

- **Authentication Flow**: WorkOS AuthKit → BFF (sealed session) → Convex (JWT)
- **Security**: CSRF protection, JWT validation, JWKS rotation, secure session cookies
- **Modern Stack**: Angular 20 with Signals, Angular Material components using MD3, TypeScript strict mode
- **Type Safety**: Shared types library ensures consistency across frontend and backend
- **DevTunnel Integration**: Enables local OIDC development with public callback URLs

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/GFVZnlA54u)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
