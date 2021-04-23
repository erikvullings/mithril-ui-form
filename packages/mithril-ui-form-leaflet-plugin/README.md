# A map plugin for Mithril-ui-form

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framwork to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

Originally, the map component was included by default, and you needed to import Leaflet and Leaflet-draw even when not using a map. Recent versions (v1.0.0+) have removed support for the leaflet map component, so you need to include it manually yourself.

```ts
import { leafletPlugin } from 'mithril-ui-form-leaflet-plugin';

...

registerPlugin('map', leafletPlugin);
```
