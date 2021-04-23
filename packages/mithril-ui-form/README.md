# Mithril-UI-Form: Create dynamic forms based on JSON as input

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framwork to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

A JSON file using a simple syntax is converted to a [materialized-css](https://materialized-css.com) form. The entered data is returned as an object.

The form supports markdown input, repeating elements a (dynamic) number of times, and conditionally displaying or disabling certain fields. If `readonly` is `true`, the form becomes a static display.

If the form is an object, you can also include a field transform (to and from) function.

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
