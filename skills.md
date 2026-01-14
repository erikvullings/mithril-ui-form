---
name: mithril-ui-form
description: A powerful, declarative framework for creating accessible, high-performance forms in Mithril applications.
---

# Mithril UI Form

`mithril-ui-form` is a powerful, declarative framework for creating accessible, high-performance forms in Mithril applications. It uses a JSON-based schema to dynamically generate forms with a wide range of features.

## Key Features

*   **Object-based and array-based forms:** Support for editing single objects or collections of objects.
*   **Rich component library:** Includes a variety of input types, such as text, textarea, select, checkbox, radio, date, time, and file uploads.
*   **Conditional logic:** Show or hide form fields based on the values of other fields.
*   **Validation:** Built-in support for required fields and custom validation rules.
*   **Plugin system:** Extend the library with custom components and functionality.
*   **Accessibility:** Full compliance with WCAG 2.1 AA standards.

## Core Components

The core library, `mithril-ui-form`, provides the main components for creating forms:

*   `LayoutForm`: For creating forms that edit a single object.
*   `ArrayLayoutForm`: For creating forms that edit a collection of objects.

## Plugin System

`mithril-ui-form` has a plugin system that allows you to extend its functionality with custom components. The `mithril-ui-form-plugin` package defines the plugin architecture.

Some example plugins include:

*   `mithril-ui-form-leaflet-plugin`: Adds a Leaflet map component.
*   `mithril-ui-form-rating-plugin`: Adds a star rating component.

## Form Field Examples

Here are some examples of the form fields you can create with `mithril-ui-form`.

### Automatic id generation

Automatically generate an `id` for a new object, only if it is undefined. You can also use `guid` if you need GUID. And instead of type "none", you can also set type "text" and disabled to true. Using type "none" will not show it.

```json
{ "id": "id", type: "none", "autogenerate": "id" }
```

### Text Input

For single-line text input.

```json
{
  "id": "name",
  "label": "Name",
  "type": "text",
  "required": true,
  "maxLength": 50,
  "placeholder": "Enter your full name"
}
```

Other useful types are `url`, `email`, and `password`.

### Text Area

For multi-line text input.

```json
{
  "id": "description",
  "label": "Description",
  "type": "textarea",
  "maxLength": 500,
  "placeholder": "Enter a description"
}
```

### Number Input

For numeric input. Use `integer` for whole numbers.

```json
{
  "id": "age",
  "label": "Age",
  "type": "number",
  "min": 0,
  "max": 120,
  "required": true
}
```

### Date and Time

For date and time input. `date`, `time`, and `datetime` types are available.

```json
{
  "id": "event_date",
  "label": "Event Date",
  "type": "datetime",
  "required": true
}
```

### Color Picker

For selecting a color.

```json
{
  "id": "theme_color",
  "label": "Theme Color",
  "type": "color"
}
```

### Select Dropdown

For selecting one or more options from a list.

```json
{
  "id": "country",
  "label": "Country",
  "type": "select",
  "options": [
    { "id": "us", "label": "United States" },
    { "id": "ca", "label": "Canada" },
    { "id": "mx", "label": "Mexico" }
  ]
}
```

### Radio Buttons

For selecting a single option from a set of choices.

```json
{
  "id": "gender",
  "label": "Gender",
  "type": "radio",
  "options": [
    { "id": "male", "label": "Male" },
    { "id": "female", "label": "Female" },
    { "id": "other", "label": "Other" }
  ]
}
```

### Checkboxes

For selecting multiple options.

```json
{
  "id": "interests",
  "label": "Interests",
  "type": "checkbox",
  "options": [
    { "id": "sports", "label": "Sports" },
    { "id": "music", "label": "Music" },
    { "id": "movies", "label": "Movies" }
  ]
}
```

### Switch

For a boolean toggle.

```json
{
  "id": "notifications",
  "label": "Enable Notifications",
  "type": "switch"
}
```

### File Upload

For uploading files. The `base64` type can be used to store the file as a base64 string.

```json
{
  "id": "avatar",
  "label": "Avatar",
  "type": "file",
  "url": "/upload",
  "options": [{ "id": "image/*" }]
}
```

### Tags Input

For creating a list of tags.

```json
{
  "id": "tags",
  "label": "Tags",
  "type": "tags"
}
```

### Autocomplete

For a text input with suggestions.

```json
{
  "id": "framework",
  "label": "JS Framework",
  "type": "autocomplete",
  "options": [
    { "id": "react", "label": "React" },
    { "id": "vue", "label": "Vue" },
    { "id": "angular", "label": "Angular" }
  ]
}
```

### Rating

A star rating component (requires the `mithril-ui-form-rating-plugin`).

```json
{
  "id": "satisfaction",
  "label": "Satisfaction",
  "type": "rating",
  "min": 1,
  "max": 5
}
```

### Map

For selecting a location on a map (requires the `mithril-ui-form-leaflet-plugin`).

```json
{
  "id": "location",
  "label": "Location",
  "type": "map",
  "required": true
}
```

### Markdown

For displaying static markdown content.

```json
{
  "type": "md",
  "value": "### Section Title\n\nThis is some informational text."
}
```

### Repeating Sections

To create a list of items, such as a list of editors.

```json
{
  "id": "editors",
  "label": "Editors",
  "repeat": true,
  "type": [
    { "id": "name", "label": "Name", "type": "text" },
    { "id": "role", "label": "Role", "type": "text" }
  ]
}
```

## Conditional Visibility

You can show or hide fields based on the values of other fields using the `show` property.

```json
{
  "id": "is_company",
  "label": "Are you a company?",
  "type": "switch"
},
{
  "id": "company_name",
  "label": "Company Name",
  "type": "text",
  "show": "is_company"
}
```
This will only show the `company_name` field when the `is_company` switch is on. `show` can also be an array, using multiple properties, e.g. `["color=red", "optionId=4"]`.

## Getting Started

To get started with `mithril-ui-form`, you can use the example application provided in the `example` package.

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm start
```

This will build all the packages and start a development server for the example application.
