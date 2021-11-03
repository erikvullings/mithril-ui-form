import m, { FactoryComponent, Attributes } from 'mithril';
import { ITabItem, TextArea, Tabs, Collapsible } from 'mithril-materialized';
import { I18n, IInputField, UIForm } from 'mithril-ui-form-plugin';
import { LayoutForm } from '.';

export interface IGeoJSONFeatureList extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The result object */
  obj: Record<string, any> | Record<string, any>[];
  /** The context */
  context: Record<string, any> | Record<string, any>[];
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (result: Record<string, any> | Record<string, any>[]) => void;
  /** Translation keys, read once on initialization */
  i18n?: Partial<I18n>;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** If true, the repeat component is disabled, and adding, deleting or editing items is prohibited */
  disabled?: boolean;
}

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */
export const GeoJSONFeatureList: FactoryComponent<IGeoJSONFeatureList> = () => {
  const state = {} as {
    dom: HTMLUListElement;
    raw: string;
    view: string;
    /** When dealing with a large list, you may add a property filter */
    filterValue?: string;
  };

  return {
    oninit: ({ attrs: { i18n = {} } }) => {
      const { raw = 'RAW', view = 'VIEW' } = i18n;
      state.raw = raw;
      state.view = view;
    },
    view: ({
      attrs: {
        field: { id = 'geojson', type, onSelect },
        obj,
        // className = field.className ? '.' + field.className.split(' ').join('.') : '.col.s12',
        // section,
        context,
        containerId,
        disabled,
        readonly,
        i18n,
        onchange,
      },
    }) => {
      const notify = (result: Record<string, any> | Record<string, any>[]) => onchange && onchange(result);
      // const { filterValue } = state;
      // const { id = '', label, type, max, propertyFilter, sortProperty, filterLabel, readonly = r } = field;
      // const strippedFilterValue = filterValue ? stripSpaces(filterValue) : undefined;
      // console.table({ id: field.id, page, curPage, maxPages, length: items.length });

      if (obj instanceof Array) return;
      const iv = obj[id] as string;
      const featureCollection = iv ? (JSON.parse(iv) as GeoJSON.FeatureCollection) : undefined;
      const features = featureCollection ? featureCollection.features || [] : [];
      const tabs = [] as ITabItem[];
      const rawTab = {
        title: state.raw,
        vnode: m(TextArea, {
          class: 'col s12',
          initialValue: featureCollection ? JSON.stringify(featureCollection, null, 2) : undefined,
          placeholder: 'Enter GeoJSON',
          onchange: (v) => (obj[id] = v),
        }),
      } as ITabItem;

      const form = type as UIForm;
      const firstTypeId = form.length > 0 ? form[0].id : undefined;
      const viewTab = {
        title: state.view,
        vnode: features.length
          ? m(Collapsible, {
              oncreate: ({ dom }) => (state.dom = dom as HTMLUListElement),
              onOpenStart: onSelect
                ? (e) => {
                    const children = state.dom.children || [];
                    for (let i = 0; i < children.length; i++) {
                      if (children[i] !== e) continue;
                      onSelect(i, features[i]);
                      return;
                    }
                  }
                : undefined,
              className: 'geojson-feature-list',
              items: features.map((feature, i) => {
                if (!feature.properties) feature.properties = {};
                return {
                  id: 'erik_' + i,
                  key: i,
                  header: firstTypeId
                    ? feature.properties[firstTypeId] || feature.geometry.type
                    : feature.geometry.type,
                  body: m(
                    '.row',
                    m(LayoutForm, {
                      class: 'col s12',
                      form,
                      obj: feature.properties!,
                      i18n,
                      context: context instanceof Array ? [obj, ...context] : [obj, context],
                      containerId,
                      disabled,
                      readonly,
                      onchange: (_, d) => {
                        if (d) features[i].properties = d;
                        obj[id] = JSON.stringify(featureCollection, null, 2);
                        notify(obj);
                      },
                    })
                  ),
                };
              }),
            })
          : m('span', '...'),
      } as ITabItem;
      tabs.push(viewTab);
      tabs.push(rawTab);
      return m(Tabs, { tabs, tabWidth: 'fill' });
    },
  };
};
