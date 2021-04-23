# Type definitions for a Mithril-ui-form plugin

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framwork to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

There were two main reasons to convert the existing mithril-ui-form to a framework supporting plugins:

- The Leaflet map component was included by default, and you needed to import them even when not using a map. Recent versions (v1.0.0+) have removed support for the leaflet map component, so you need to include it manually yourself

```ts
import { leafletPlugin } from 'mithril-ui-form-leaflet-plugin';

...

registerPlugin('map', leafletPlugin);
```

- You could not add your own types, e.g. to create a questionnaire, I needed a (no-star-based) rating component, and that was not easy to integrate into a form. Now, you can just register it yourself.

```ts
registerPlugin('rating', myRatingPlugin, myReadonlyRatingPlugin);
```

Since each plugin is a Mithril FactoryComponent, i.e. a function that returns a Component object with a view method, it is very easy to roll your own.

```ts
import { FactoryComponent } from 'mithril';

export type PluginType = FactoryComponent<{
  /** Initial value, typically a string, number or boolean */
  iv: any;
  /** Original properties of the form field */
  field: Record<string, any>;
  /** Partially converted properties, e.g. the ones containing placeholders for other variables, e.g. label, description, etc. */
  props: Record<string, any>;
  /** Label, raw version of props.label */
  label?: string;
  /** Only present when component is not readonly */
  onchange?: (value: string | number | Array<string | number | Record<string, any>> | Date | boolean) => Promise<void>;
}>;
```
