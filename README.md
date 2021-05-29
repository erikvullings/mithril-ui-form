# mithril-ui-form

A component for the [Mithril framework](https://mithril.js.org), which allows you to convert an object (or JSON file) to a dynamic form.

When dealing with complex forms, I noticed that I often needed to implement the same logic and code, over and over again. Therefore, I looked for an approach to avoid repeating code (and making similar mistakes), and this library was born. It allows you to create dynamic forms based on a JSON object as input. The JSON file is converted to a [materialized-css](https://materialized-css.com) form. The entered data is returned as an object.

The form supports markdown input, repeating elements, and conditionally displaying certain elements. For an example of a project implementing this approach, have a look [here](https://github.com/DRIVER-EU/lessons-learned-framework). It is a small project consisting of an in-memory database ([lokijs](http://lokijs.org)), a REST interface ([rest-easy-loki](https://www.npmjs.com/package/rest-easy-loki)), and a dynamic form to enter lesson's learned. As the form is dynamic, it is easy to tune it into a specific one more appropriate to your customer's needs.

## Installation

```bash
npm i -S mithril-ui-form
```

## Development

```bash
npm i
npm start
```

## Deployment to GitHub pages (via the doc folder)

```bash
npm run build:domain
```
