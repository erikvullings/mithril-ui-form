# mithril-ui-form

A powerful, declarative component for the [Mithril framework](https://mithril.js.org) that converts JSON specifications into dynamic, accessible forms with full TypeScript support.

**✨ What's New in v1.10.16+**

- 🎯 **ArrayLayoutForm** - Native support for array-based forms with drag-and-drop
- ⚡ **Performance improvements** - 30-50% faster rendering through memoization
- ♿ **Enhanced accessibility** - Full WCAG compliance with ARIA attributes
- 🔧 **Better TypeScript** - Improved type safety and IntelliSense support
- 🌐 **Multi-platform** - Browser, CommonJS, and ESM module support

When dealing with complex forms, this library eliminates repetitive code and provides a consistent approach to form generation. It converts JSON specifications into beautiful [materialized-css](https://materialized-css.com) forms with advanced features like conditional display, validation, repeating elements, and now - **array management**.

The form supports markdown input, repeating elements, conditionally displaying certain elements, and **managing arrays of objects** with an intuitive interface. Perfect for building dynamic forms that adapt to your data structure.

## Installation

```bash
npm install mithril-ui-form
# or
pnpm add mithril-ui-form
# or  
yarn add mithril-ui-form
```

## Quick Start

### ESM Module (Recommended)

```javascript
import m from 'mithril';
import { LayoutForm, ArrayLayoutForm } from 'mithril-ui-form';

// Object-based form
const form = [
  { id: 'name', type: 'text', label: 'Name' },
  { id: 'email', type: 'email', label: 'Email' }
];

const obj = { name: '', email: '' };

m.mount(document.body, {
  view: () => m(LayoutForm(), {
    form,
    obj,
    onchange: (isValid, updatedObj) => {
      console.log('Form valid:', isValid, 'Data:', updatedObj);
    }
  })
});
```

### CommonJS

```javascript
const m = require('mithril');
const { LayoutForm, ArrayLayoutForm } = require('mithril-ui-form');

// Same usage as ESM
```

### Browser Script Tag

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <script src="https://unpkg.com/mithril/mithril.js"></script>
  <script src="https://unpkg.com/mithril-ui-form/lib/index.umd.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    const { LayoutForm, ArrayLayoutForm } = window.MithrilUIForm;
    
    const form = [
      { id: 'name', type: 'text', label: 'Name' },
      { id: 'email', type: 'email', label: 'Email' }
    ];
    
    const obj = { name: '', email: '' };
    
    m.mount(document.getElementById('app'), {
      view: () => m(LayoutForm(), {
        form,
        obj,
        onchange: (isValid, updatedObj) => {
          console.log('Form valid:', isValid, 'Data:', updatedObj);
        }
      })
    });
  </script>
</body>
</html>
```

## 🎯 New: ArrayLayoutForm - Managing Arrays of Data

The `ArrayLayoutForm` component provides an elegant solution for managing arrays of objects with full drag-and-drop support, validation, and accessibility.

### Basic Array Form Example

```javascript
import { ArrayLayoutForm } from 'mithril-ui-form';

// Define the form structure for each array item
const personForm = [
  { id: 'name', type: 'text', label: 'Full Name', required: true },
  { id: 'email', type: 'email', label: 'Email Address', required: true },
  { id: 'age', type: 'number', label: 'Age', min: 0, max: 120 }
];

// Your data
const people = [];

// Create the array form
m(ArrayLayoutForm(), {
  form: personForm,
  items: people,
  onchange: (updatedItems) => {
    people.splice(0, people.length, ...updatedItems);
    console.log('Updated people:', people);
  },
  createItem: () => ({ name: '', email: '', age: 0 }), // Factory for new items
  label: 'Team Members',
  min: 1,          // Minimum required items
  max: 10,         // Maximum allowed items  
  showNumbers: true,      // Show item numbers
  allowReorder: true,     // Enable drag-and-drop
})
```

### Advanced Array Form Features

```javascript
m(ArrayLayoutForm(), {
  form: personForm,
  items: people,
  onchange: (items) => { /* handle change */ },
  
  // Custom item creation
  createItem: () => ({
    id: `person_${Date.now()}`,
    name: '',
    email: '',
    role: 'member'
  }),
  
  // Constraints
  min: 2,           // Must have at least 2 items
  max: 20,          // Cannot exceed 20 items
  
  // UI Options
  label: 'Project Team',
  showNumbers: true,
  allowReorder: true,
  className: 'my-array-form',
  
  // Localization
  i18n: {
    add: 'Add Team Member',
    noItems: 'No team members yet',
    addFirst: 'Add your first team member',
    remove: 'Remove member',
    addAnother: 'Add another member'
  },
  
  // Accessibility
  containerId: 'main-content'
})
```

## Array Manipulation Utilities

The library includes powerful utilities for array operations:

```javascript
import { arrayUtils } from 'mithril-ui-form';

const myArray = [{ id: 1 }, { id: 2 }, { id: 3 }];

// Move item from index 2 to index 0
const reordered = arrayUtils.moveItem(myArray, 2, 0);

// Insert item at specific position
const withNew = arrayUtils.insertAt(myArray, 1, { id: 4 });

// Remove item at index
const removed = arrayUtils.removeAt(myArray, 1);

// Swap two items
const swapped = arrayUtils.swap(myArray, 0, 2);

// Duplicate an item (with deep copy)
const duplicated = arrayUtils.duplicate(myArray, 1);

// Validate array constraints
const isValid = arrayUtils.isValidArray(myArray, 2, 10); // min: 2, max: 10
```

## Development

```bash
npm install
npm start
```

## Deployment to GitHub pages (via the doc folder)

```bash
npm run build:domain
```
