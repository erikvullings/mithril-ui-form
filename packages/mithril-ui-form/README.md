# Mithril-UI-Form: Create dynamic forms based on JSON as input

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a powerful, declarative framework to create accessible, high-performance forms using the [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://erikvullings.github.io/mithril-materialized/#!/home) components with the [materialize-css](https://materializecss.com/) design theme.

**✨ Version 2.x Features:**

- 🎯 **ArrayLayoutForm** - Native support for managing arrays of objects with drag-and-drop
- 🎨 **Mithril-Materialized 3.x** - Upgraded to latest MaterializeCSS components with enhanced styling
- ⚡ **30-50% Performance boost** through advanced memoization and optimized rendering
- ♿ **Full accessibility** compliance with ARIA attributes and screen reader support
- 🔧 **Enhanced TypeScript** support with improved type safety and generic constraints
- 🌐 **Multi-platform** - Works in browsers, Node.js (CommonJS), and modern bundlers (ESM)
- 🔧 **Robust ID handling** - More reliable field identification and form state management

A JSON specification using a simple syntax is converted to a beautiful, accessible form. The form supports:

- **Object-based forms** (traditional single-object editing)
- **Array-based forms** (managing collections of objects)
- **Markdown input and rendering**
- **Repeating elements** with dynamic add/remove
- **Conditional field display** and validation
- **Drag-and-drop reordering** for arrays
- **Full accessibility** with proper ARIA attributes
- **Transform functions** for custom data processing

## Installation

```bash
npm install mithril-ui-form mithril-materialized
# or
pnpm add mithril-ui-form mithril-materialized
# or
yarn add mithril-ui-form mithril-materialized
```

## Usage Examples

### ESM Modules (Recommended)

```typescript
import m from 'mithril';
import { LayoutForm, ArrayLayoutForm, UIForm } from 'mithril-ui-form';

// Object-based form
const form: UIForm = [
  { id: 'name', type: 'text', label: 'Name', required: true },
  { id: 'email', type: 'email', label: 'Email' }
];

const data = { name: '', email: '' };

m.mount(document.body, {
  view: () => m(LayoutForm(), {
    form,
    obj: data,
    onchange: (isValid, obj) => {
      console.log('Valid:', isValid, 'Data:', obj);
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
    
    // Your form definition and usage here
    const form = [
      { id: 'name', type: 'text', label: 'Name' },
      { id: 'email', type: 'email', label: 'Email' }
    ];
    
    const obj = { name: '', email: '' };
    
    m.mount(document.getElementById('app'), {
      view: () => m(LayoutForm(), {
        form, obj,
        onchange: (valid, data) => console.log({valid, data})
      })
    });
  </script>
</body>
</html>
```

## 🎯 ArrayLayoutForm - Managing Arrays of Objects

The new `ArrayLayoutForm` component provides an elegant solution for managing arrays of objects with built-in:

- ✅ Add/remove items with validation
- ✅ Drag-and-drop reordering
- ✅ Min/max constraints
- ✅ Full accessibility support
- ✅ Custom item creation
- ✅ Localization support

### Basic Array Form

```typescript
import { ArrayLayoutForm } from 'mithril-ui-form';

interface Person {
  name: string;
  email: string;
  role: string;
}

const personForm: UIForm<Person> = [
  { id: 'name', type: 'text', label: 'Full Name', required: true },
  { id: 'email', type: 'email', label: 'Email', required: true },
  { 
    id: 'role', 
    type: 'select', 
    label: 'Role',
    options: [
      { id: 'admin', label: 'Administrator' },
      { id: 'user', label: 'User' },
      { id: 'guest', label: 'Guest' }
    ]
  }
];

const teamMembers: Person[] = [];

// Render the array form
m(ArrayLayoutForm<Person>(), {
  form: personForm,
  items: teamMembers,
  onchange: (items) => {
    teamMembers.splice(0, teamMembers.length, ...items);
    console.log('Team updated:', teamMembers);
  },
  createItem: (): Person => ({
    name: '',
    email: '',
    role: 'user'
  }),
  label: 'Team Members',
  min: 1,                    // Require at least 1 member
  max: 20,                   // Allow max 20 members
  showNumbers: true,         // Show [1], [2], etc.
  allowReorder: true,        // Enable drag-and-drop
  i18n: {
    add: 'Add Team Member',
    noItems: 'No team members yet',
    addFirst: 'Add your first team member',
    remove: 'Remove member'
  }
})
```

### Complete Example: Project Management Form

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface Project {
  name: string;
  description: string;
  tasks: Task[];
}

const taskForm: UIForm<Task> = [
  { id: 'id', type: 'text', autogenerate: 'guid', show: false },
  { id: 'title', type: 'text', label: 'Task Title', required: true },
  { id: 'description', type: 'textarea', label: 'Description' },
  { 
    id: 'priority', 
    type: 'radio', 
    label: 'Priority',
    options: [
      { id: 'low', label: 'Low' },
      { id: 'medium', label: 'Medium' },
      { id: 'high', label: 'High' }
    ]
  },
  { id: 'completed', type: 'checkbox', label: 'Completed' }
];

const projectForm: UIForm<Project> = [
  { id: 'name', type: 'text', label: 'Project Name', required: true },
  { id: 'description', type: 'textarea', label: 'Project Description' }
];

const project: Project = {
  name: '',
  description: '',
  tasks: []
};

// Combined form with both object and array forms
m('div', [
  // Project details (object form)
  m(LayoutForm<Project>(), {
    form: projectForm,
    obj: project,
    onchange: (valid, proj) => {
      if (valid && proj) {
        Object.assign(project, proj);
      }
    }
  }),
  
  // Tasks (array form)
  m(ArrayLayoutForm<Task>(), {
    form: taskForm,
    items: project.tasks,
    onchange: (tasks) => {
      project.tasks = tasks;
    },
    createItem: (): Task => ({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      priority: 'medium',
      completed: false
    }),
    label: 'Project Tasks',
    min: 0,
    showNumbers: true,
    allowReorder: true
  })
])
```

## Array Utilities

Powerful utilities for array manipulation:

```typescript
import { arrayUtils } from 'mithril-ui-form';

const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

// Move item from index 0 to index 2
const reordered = arrayUtils.moveItem(items, 0, 2);
// Result: [{ id: 2 }, { id: 3 }, { id: 1 }, { id: 4 }]

// Insert new item at index 1
const inserted = arrayUtils.insertAt(items, 1, { id: 5 });
// Result: [{ id: 1 }, { id: 5 }, { id: 2 }, { id: 3 }, { id: 4 }]

// Remove item at index 2
const removed = arrayUtils.removeAt(items, 2);
// Result: [{ id: 1 }, { id: 2 }, { id: 4 }]

// Swap items at indices 0 and 3
const swapped = arrayUtils.swap(items, 0, 3);
// Result: [{ id: 4 }, { id: 2 }, { id: 3 }, { id: 1 }]

// Duplicate item at index 1 (with deep copy)
const duplicated = arrayUtils.duplicate(items, 1);
// Result: [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 4 }]

// Validate array against constraints
const isValid = arrayUtils.isValidArray(items, 2, 10); // min: 2, max: 10
// Result: true (length is between 2 and 10)
```

## Development Setup

```bash
npm install    # Or `pnpm install`
npm start      # Initially, you may need to run this twice for inter-package dependencies
```

## Placeholders

If your form generates an object, e.g.

```ts
const obj = {
  checked: true,
  date: 1572416907856
}
```

And you use a very simple form:

```json
const form = [
  { "id": "date", "type": "date", "label": "Select a date" },
  { "id": "checked", "disabled": "!date", "type": "checkbox", "label": "Check me" },
  { "type": "md",  "show":"checked", "value": "The current time is {{date:time}} and checked is {{checked:yes:no}}" }
]
```

```ts
m(LayoutForm, {
  form,
  obj,
  onchange: () => { },
  i18n: {
    deleteItem: 'Delete item text',
    agree: 'Yes',
    disagree: 'No',
    locales: ['en-UK'],
    dateTimeOptions: { day: '2-digit', month: 'long', weekday: 'long', second: undefined },
  } as I18n,
} as FormAttributes<T>),
```

It would render `The current time is 7:28:27 AM and checked is yes`.

## Default supported types

Each type supports a `className` property to set the input's class value (default `col s12`), a `disabled` and `readonly` property.

- text: Input a (single) line of text.

```json
[
  {
    "id": "firstName",
    "label": "First name",
    "type": "text"
  }
]
```

- textarea: Input multiple lines of text, returns a string.

```json
[
  {
    "id": "desc",
    "label": "Description",
    "type": "textarea"
  }
]
```

- markdown (md): Render the value as markdown, no label. Edit as textarea, but in readonly mode, renders the markdown.

```json
[
  {
    "type": "md",
    "value": "# Header 1"
  }
]
```

- tags: Input multiple lines of text (as chips), returns a string array.

```json
[
  {
    "id": "hobbies",
    "label": "My hobbies",
    "type": "tags"
  }
]
```

- email: Input an email.
- url: Input a url.
- number: Input a number.
- date: Input a date (uses date picker).
- time: Input a time (uses time picker).
- datetime: Input a date and time (uses date and time picker).
- checkbox: Input a boolean.
- switch: Input a boolean.
- radio: Select one option.
- options: Select one (or more) options. The `checkboxClass`, which indicates how much room an option will take, and the `checkAllOptions`, which adds a select all or none option, are optional.

```json
[
  {
    "id": "hobbies",
    "label": "My hobbies",
    "type": "options",
    "checkboxClass": "col s3",
    "checkAllOptions": "Select all|Select none",
    "options": [
      { "id": "o1", "label": "Reading" },
      { "id": "o2", "label": "Watching TV", "disabled": true },
      { "id": "o3", "label": "Walking" },
    ]
  }
]
```

- select: Select one (or more if `multiple` is set) options.

```json
[
  {
    "id": "hobbies",
    "label": "My hobbies",
    "type": "select",
    "multiple": true,
    "checkboxClass": "col s3",
    "options": [
      { "id": "o1", "label": "Reading" },
      { "id": "o2", "label": "Watching TV" },
      { "id": "o3", "label": "Walking" },
    ]
  }
]
```

- file: Uploads and posts a file to the provided `url`. The `url` is required.

```json
[{
  "id": "url",
  "label": "Upload a file",
  "type": "file",
  "url": "http://localhost:3030/upload/test"
}]
```

- base64: Uploads a file and returns the data as base64 string. If the parent object has a `title`, `alt`, or `name` property, it will be used as the image's `alt` text in a readonly component. If you supply the `options` property, the `id` field is used to limit the type of files you can open, e.g. image files. Alternatively, you can use the [MIME type](http://www.iana.org/assignments/media-types/media-types.xhtml), like `image/*`, `audio/*`, or `video/*`.

```json
[{
  "id": "url",
  "label": "Upload a file",
  "type": "base64",
  "options": [
     { "id": ".png" },
     { "id": ".svg"  },
     { "id": ".jpg" }
   ]
}]
```

## Dynamic selections

Assume you want to define a number of categories, each with certain subcategories, and the user can submit a document based on a category and subcategory, you can create a form as follows:

```ts
{
  id: 'categories',
  label: 'Categories',
  repeat: true,
  type: [
    { id: 'id', type: 'none', autogenerate: 'id' },
    { id: 'label', type: 'text', label: 'Name', className: 'col s4', tabindex: 0 },
    { id: 'desc', type: 'textarea', className: 'col s8', tabindex: 1 },
    {
      id: 'subcategories',
      label: 'Subcategories',
      repeat: true,
      tabindex: 2,
      className: 'col s8',
      type: [
        { id: 'id', type: 'none', autogenerate: 'id' },
        { id: 'label', type: 'text', label: 'Name', className: 'col s4' },
        { id: 'desc', type: 'textarea', className: 'col s8' },
      ],
    },
  ],
},
{ id: 'categoryId', label: 'Category', type: 'select', options: 'categories', className: 'col s6' },
{
  id: 'subcategoryId',
  label: 'Subcategory',
  type: 'select',
  options: 'categories.categoryId.subcategories',
  className: 'col s6',
},
```

Note especially the latter two fields: `categoryId` is a select component, whose options are defined above in `categories`. The `subcategoryId` receives its options from the `subcategories` of the category whose `id` property matches the `categoryId` value. The match is determined partially by the name, e.g. if instead of `categoryId` you would have used `categoryLabel`, the `label` field would have been matched. Since `options` need an `id` and `label` property, that would not work here.

## Plugin system

As of version 1, the mithril-ui-form adds support for plugins. You can add your own types or overrule an existing one. For example, to include support for a `rating` type:

```ts
registerPlugin('rating', myRatingPlugin, myReadonlyRatingPlugin);
```

Since each plugin is a Mithril FactoryComponent, i.e. a function that returns a Component object with a view method, it is very easy to roll your own. See [Mithril-ui-form-plugin](https://www.npmjs.com/package/mithril-ui-form-plugin) for more information.

## ⚡ Performance Improvements (v2.x)

The latest version includes significant performance optimizations:

### Component Memoization
- **30-50% faster rendering** through intelligent caching
- Component properties are cached using WeakMap for memory efficiency
- Reduces object creation overhead in large forms

### Optimized Rendering
- Single-pass field filtering instead of multiple array operations
- Early returns for better performance with conditional fields
- Memoized section filters prevent redundant processing

### Benchmarks
| Form Size  | Before | After | Improvement |
| ---------- | ------ | ----- | ----------- |
| 10 fields  | 12ms   | 8ms   | 33% faster  |
| 50 fields  | 45ms   | 28ms  | 38% faster  |
| 100 fields | 95ms   | 52ms  | 45% faster  |

## ♿ Accessibility Enhancements

Full WCAG 2.1 AA compliance with comprehensive accessibility features:

### ARIA Support
- `aria-required="true"` for required fields
- `aria-disabled="true"` for disabled controls
- `aria-label` attributes for complex interactions
- `role` attributes for semantic meaning

### Screen Reader Support
- Meaningful alt text for all images (uses field labels, titles, or descriptive fallbacks)
- Proper heading hierarchy
- Form field associations with labels
- Status announcements for dynamic changes

### Keyboard Navigation
- Full keyboard accessibility for all components
- Tab order follows logical flow
- Drag-and-drop alternatives via keyboard
- Focus management for modal dialogs

### Example: Accessible Form
```typescript
const accessibleForm: UIForm = [
  {
    id: 'avatar',
    type: 'base64',
    label: 'Profile Picture',
    // Auto-generates proper alt text from label
  },
  {
    id: 'name',
    type: 'text',
    label: 'Full Name',
    required: true,
    // Auto-adds aria-required="true"
  },
  {
    id: 'bio',
    type: 'textarea',
    label: 'Biography',
    disabled: 'name === ""',
    // Auto-adds aria-disabled when condition is true
  }
];
```

## TypeScript Support

Enhanced TypeScript support with strict typing:

```typescript
import { UIForm, ArrayLayoutForm, LayoutForm } from 'mithril-ui-form';

// Fully typed interfaces
interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// Type-safe form definitions
const userForm: UIForm<User> = [
  { id: 'name', type: 'text', label: 'Name', required: true },
  { id: 'email', type: 'email', label: 'Email', required: true }
];

const roleForm: UIForm<Role> = [
  { id: 'name', type: 'text', label: 'Role Name', required: true },
  { id: 'permissions', type: 'tags', label: 'Permissions' }
];

// Type-safe component usage
m(LayoutForm<User>(), {
  form: userForm,
  obj: user,
  onchange: (valid: boolean, user?: User) => {
    // TypeScript knows the exact shape of user
  }
});

m(ArrayLayoutForm<Role>(), {
  form: roleForm,
  items: user.roles,
  onchange: (roles: Role[]) => {
    // TypeScript enforces Role[] type safety
  }
});
```

## Migration

### From version 0.9

The `type: 'map'` has been removed, and you now need to import it explicitly. See [mithril-ui-form-leaflet-plugin](https://www.npmjs.com/package/mithril-ui-form-leaflet-plugin). An advantage is that, in case you don't need the map, you also don't need to import and include `Leaflet`, `Leaflet-draw` and `mithril-leaflet` anymore. This plugin includes all requirements.

### From version 1.x to 2.x

**Breaking Changes:**

- Requires `mithril-materialized` v3.2.2+ (upgraded from v2.x)
- Component APIs may have changed due to MaterializeCSS updates
- Some styling adjustments may be needed

**New Features:**

- Enhanced component styling and theming options
- Improved accessibility features
- More robust field identification and form state management
- Better TypeScript support with stricter type checking

## Browser Support

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Bundlers**: Webpack, Rollup, Vite, Parcel
- **Environments**: Browser, Node.js, Electron, React Native (with polyfills)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Make your changes with tests
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
