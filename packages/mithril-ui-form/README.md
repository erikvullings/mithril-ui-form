# Mithril-UI-Form

Create dynamic forms based on JSON as input.

A JSON file using a simple syntax is converted to a [materialized-css](https://materialized-css.com) form. The entered data is returned as an object.

The form supports markdown input, repeating elements a (dynamic) number of times, and conditionally displaying certain elements.

## TODO

- Create a markdown component: put in markdown, and use slimdown or marked (configurable) to render HTML
- Create a handlebars component: put in a template and an object, and render HTML

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
