# Mithril-UI-Form

Create dynamic forms based on JSON as input.

A JSON file using a simple syntax is converted to a [materialized-css](https://materialized-css.com) form. The entered data is returned as an object.

The form supports markdown input, repeating elements a (dynamic) number of times, and conditionally displaying or disabling certain fields.

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

## TODO

- repeat: true, min: 2, max: 5, should limit the number of repeats to 5 and require a minimum of 2.
- Add pre-sets, overriding existing values.
- Add support for getting the value of an option based on id. E.g. extract all options to a new object (key is the id of the field, value is the list of options), so we can resolve their values easily later.
- Create a handlebars-like component: put in a template and an object, and render HTML
- Use this tool to create your own form schemas. E.g. a two-column layout, where you define your schema in the left column, and see the results in the right column.

## Remarks about the LLF

- Start with the event description
- End with editors and sources

## Process

Start with a TypeScript interface of the desired object.

```ts
interface IEditor { name: string; role: string; organisation: string; email: string; }
interface ISource { title: string; url: string; }

interface ILessonLearned {
  id: string;
  event: string;
  description: string;
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources: ISource[];
  eventDescription: {
    riskCategory: {};
    ...
  }
}
```

Based on the interface, create a Form:

```ts

interface IFormComponent<T> {}

interface IMultiFormComponent<T> {
  [key: keyof T]: IFormComponent<T> | IFormComponent<T>[] | IMultiFormComponent<T>;
}

const editor = {
  name:  { type: 'text', maxLength: 80, required: true, className: 'col.s6' },
  role:  { type: 'text', maxLength: 20 },
} as IFormComponent<ILessonLearned>;

const source = {
  title:  { type: 'text', maxLength: 80, required: true, icon: 'title' },
  url:  { type: 'url', maxLength: 80, required: true },
} as IFormComponent<ILessonLearned>;

const info = {
  id: { type: 'text', maxLength: 80, required: true },
  event:  { type: 'text', maxLength: 80, required: true },
  description:  { type: 'textarea', maxLength: 500, required: true },
  created: { type: 'date', required: true },
  edited: { type: 'date', required: true },
  editors: { type: 'kanban', model: editor },
} as IMultiFormComponent<ILessonLearned>;

const ll = {
  info,
  sources: [source],
  eventDescription: {}
} as IMultiFormComponent<ILessonLearned>;
```
