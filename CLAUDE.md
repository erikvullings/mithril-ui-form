# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mithril-ui-form is a monorepo containing a powerful, declarative component library for the Mithril framework that converts JSON specifications into dynamic, accessible forms with full TypeScript support. The project emphasizes performance, accessibility (WCAG compliance), and developer experience.

## Monorepo Structure

This is a pnpm workspace with the following key packages:

- **packages/mithril-ui-form/** - Main library with core form components (LayoutForm, ArrayLayoutForm)
- **packages/mithril-ui-form-plugin/** - Base plugin system and type definitions  
- **packages/mithril-ui-form-leaflet-plugin/** - Plugin for geospatial/leaflet map integration
- **packages/mithril-ui-form-rating-plugin/** - Plugin for star rating components
- **packages/example/** - Demo application showcasing all features

## Development Commands

### Workspace Commands (run from root)
- `pnpm install` - Install all dependencies across workspace
- `pnpm build` - Build all packages in dependency order
- `pnpm start` - Start development mode for all packages in parallel
- `pnpm patch-release` - Release patch version for all packages
- `pnpm minor-release` - Release minor version for all packages

### Main Library Commands (packages/mithril-ui-form/)
- `npm start` or `npm run dev` - Start rollup in watch mode for library development
- `npm run build` - Build library using rollup (generates CommonJS, ESM, IIFE formats)
- `npm run clean` - Clean build artifacts and cache
- `npm run gen:schema` - Generate JSON schema from TypeScript types

### Example Application Commands (packages/example/)
- `npm start` - Start webpack dev server on port 1233
- `npm run build` - Build production bundle
- `npm run build:domain` - Build for GitHub Pages deployment to docs/ folder

## Core Architecture

### Component Patterns
The codebase follows specific Mithril patterns as noted in the global CLAUDE.md:
- Uses **FactoryComponents** for stateless components
- Uses **MeiosisViewComponent** when component state is required  
- Follows Meiosis state pattern (https://meiosis.js.org/) for state management
- Uses `const` function declarations consistently

### Main Components
- **LayoutForm** - Core form component that renders object-based forms from JSON specifications
- **ArrayLayoutForm** - Specialized component for managing arrays of objects with drag-and-drop, validation
- **FormFieldFactory** - Factory function that creates appropriate field components based on type
- **Plugin System** - Extensible architecture via `registerPlugin()` for custom field types

### Key Libraries & Dependencies
- **mithril** - Core framework (peer dependency)
- **mithril-materialized** - UI components (peer dependency) 
- **slimdown-js** - Lightweight markdown parser
- **materialize-css** - CSS framework for styling

## Build System

### Main Library (rollup)
- Uses rollup for library bundling with TypeScript compilation
- Generates multiple output formats: CommonJS, ESM, IIFE with sourcemaps
- External dependencies: mithril, mithril-materialized, materialize-css, leaflet libraries

### Example App (webpack)
- Uses webpack with TypeScript loader and dev server
- Production builds output to `../../docs` for GitHub Pages
- Supports hot reloading on port 1233

## Plugin Architecture

### Creating Custom Plugins
```typescript
import { PluginType } from 'mithril-ui-form-plugin';
import { registerPlugin } from 'mithril-ui-form';

const myPlugin: PluginType = /* implementation */;
registerPlugin('myType', myPlugin, optionalReadonlyPlugin);
```

### Available Plugin Types
- **rating** - Star rating component (mithril-ui-form-rating-plugin)
- **leaflet** - Map-based input fields (mithril-ui-form-leaflet-plugin)

## Form Configuration

Forms are defined as JSON arrays of field specifications:
```typescript
const form: UIForm<T> = [
  { id: 'name', type: 'text', label: 'Name', required: true },
  { id: 'email', type: 'email', label: 'Email' },
  { id: 'items', type: 'array', label: 'Items' }  // Uses ArrayLayoutForm
];
```

## Testing & Quality

- Uses TypeScript with strict configuration
- TSLint for code quality (older projects)
- No test framework currently configured - rely on example app for integration testing

## Deployment

The example application deploys to GitHub Pages via the `docs/` folder:
- Production builds are output to `docs/` directory  
- Configured for `https://erikvullings.github.io/mithril-ui-form/` base path
- Use `npm run build:domain` in example package to build for deployment