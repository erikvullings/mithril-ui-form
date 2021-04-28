# A rating plugin for Mithril-ui-form

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framwork to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

A simple rating control, i.e. a horizontal list of radio buttons, with optional labels for each item.

## Include rating control

```ts
import { ratingPlugin } from "mithril-ui-form-rating-plugin";

...

registerPlugin("map", ratingPlugin);
```

## Optional CSS style

Please include the following CSS style to make it look good.

```css
.muf-rating {
  width: 100%;
  padding: 0.5rem 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
}
.muf-rating > .label {
  width: 50%;
}
.muf-rating > .radios {
  width: 50%;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
}
.muf-rating > .radios > label {
  display: inline-block;
  padding: 0 0.1rem 1rem 0.1rem;
  text-align: center;
}
.muf-rating > .radios > label > input[type='radio'] {
  opacity: 1; /* only needed when using materialize-css */
}
```

## Example usage

<img alt="Example" src="data:image/png;base64,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">

```json
{ 
  "id": "my_rating", 
  "type": "rating",
  "label": "What do you think of this plugin?",
  "description": "_Please, be honest!_",
  "min": 0,
  "max": 5,
  "ratings": {
    "0": "extremely<br>bad",
    "5": "super<br>good"
  }
},
```
