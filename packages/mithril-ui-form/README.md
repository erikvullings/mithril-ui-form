# Mithril-UI-Form: Create dynamic forms based on JSON as input

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framework to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

A JSON file using a simple syntax is converted to a [materialized-css](https://materialized-css.com) form. The entered data is returned as an object.

The form supports markdown input, repeating elements a (dynamic) number of times, and conditionally displaying or disabling certain fields. If `readonly` is `true`, the form becomes readonly.

If the form is an object instead of a JSON file, you can also include a field transform (to and from) function.

## Installation

```bash
npm i       # Or `pnpm i`
npm start   # Initially, you may need to run this twice, as their are inter-package dependencies
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
}),
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

## Migration

### From version 0.9

The `type: 'map'` has been removed, and you now need to import it explicitly. See [mithril-ui-form-leaflet-plugin](https://www.npmjs.com/package/mithril-ui-form-leaflet-plugin). An advantage is that, in case you don't need the map, you also don't need to import and include `Leaflet`, `Leaflet-draw` and `mithril-leaflet` anymore. This plugin includes all requirements.

## TODO

- When repeat = true, min: 2, max: 5 should limit the number of repeats to 5 and require a minimum of 2.
- Add pre-sets, overriding existing values.
- Use this tool to create your own form schemas. E.g. a two-column layout, where you define your schema in the left column, and see the results in the right column.
