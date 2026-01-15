# Mithril-UI-Form

This document provides a comprehensive overview of the `mithril-ui-form` project, its architecture, and development conventions.

## Project Overview

`mithril-ui-form` is a powerful, declarative framework for creating accessible, high-performance forms in Mithril applications. It uses a JSON-based schema to dynamically generate forms with a wide range of features, including:

*   **Object-based and array-based forms:** Support for editing single objects or collections of objects.
*   **Rich component library:** Includes a variety of input types, such as text, textarea, select, checkbox, radio, date, time, and file uploads.
*   **Conditional logic:** Show or hide form fields based on the values of other fields.
*   **Validation:** Built-in support for required fields and custom validation rules.
*   **Plugin system:** Extend the library with custom components and functionality.
*   **Accessibility:** Full compliance with WCAG 2.1 AA standards.

The project is structured as a pnpm monorepo, with the following packages:

### Packages

*   **`mithril-ui-form`**: The core library that provides the main `LayoutForm` and `ArrayLayoutForm` components, as well as all the built-in form components.
*   **`mithril-ui-form-plugin`**: This package defines the plugin architecture for `mithril-ui-form`. It provides the `registerPlugin` function and the `Plugin` interface that all plugins must implement.
*   **`mithril-ui-form-leaflet-plugin`**: A plugin that adds a Leaflet map component to `mithril-ui-form`. This is a good example of how to create a custom form component and integrate it into the library.
*   **`mithril-ui-form-rating-plugin`**: A plugin that adds a star rating component to `mithril-ui-form`.
*   **`example`**: A webpack-based application that demonstrates how to use the `mithril-ui-form` library and its plugins. It also serves as a development environment for testing new features.

## Building and Running

The project uses `pnpm` for package management and scripting.

### Key Commands

*   **Installation:**
    ```bash
    pnpm install
    ```
*   **Development:**
    ```bash
    pnpm start
    ```
    This command builds all the packages and starts a development server for the example application.
*   **Building:**
    ```bash
    pnpm build
    ```
    This command builds all the packages in the monorepo.
*   **Testing:**
    ```bash
    pnpm test
    ```
    This command runs the tests for all the packages.
*   **Documentation:**
    ```bash
    pnpm docs
    ```
    This command generates API documentation for the `mithril-ui-form` package.

## Development Conventions

### Coding Style

The project uses Prettier for code formatting. The configuration is defined in the `.prettierrc` file.

### Testing

The project uses Jest for testing. Test files are located in the `test` directory of each package.

### Committing

Commit messages should follow the Conventional Commits specification. A `.gitmessage` file is provided to help with formatting commit messages.

### Releasing

The project uses `semantic-release` to automate the release process. The release configuration is defined in the `.releaser.json` files.