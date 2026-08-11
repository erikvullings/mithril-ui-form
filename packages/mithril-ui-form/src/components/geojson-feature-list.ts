import m, { Attributes, Component } from 'mithril';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import { TabItem, TextArea, NumberInput, Tabs, Collapsible, Button, ConfirmButton, Select } from 'mithril-materialized';
import { FormAttributes, I18n, InputField, UIForm } from 'mithril-ui-form-plugin';
import { LayoutForm } from './layout-form';
import { ArrayLayoutForm, IArrayLayoutForm } from './array-layout-form';

export interface IGeoJSONFeatureList<O extends Attributes = {}, K extends keyof O = keyof O> extends Attributes {
  id?: K;
  /** The input field (or form) that must be rendered repeatedly */
  field: InputField<O>;
  /** The result object */
  obj: O;
  /** The context */
  context: Array<O | O[keyof O]>;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (result: O) => void;
  /** Translation keys, read once on initialization */
  i18n?: Partial<I18n>;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** If true, the repeat component is disabled, and adding, deleting or editing items is prohibited */
  disabled?: boolean;
  readonly?: boolean;
}

type GeometryType = 'Point' | 'LineString' | 'Polygon';

const geometryTypeOptions: Array<{ id: GeometryType; label: string }> = [
  { id: 'Point', label: 'Point' },
  { id: 'LineString', label: 'Line' },
  { id: 'Polygon', label: 'Polygon' },
];

const defaultGeometry = (type: GeometryType): Geometry => {
  switch (type) {
    case 'LineString':
      return {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      };
    case 'Polygon':
      return {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      };
    case 'Point':
    default:
      return { type: 'Point', coordinates: [0, 0] };
  }
};

const geometryIcon = (type?: string) => {
  switch (type) {
    case 'LineString':
    case 'MultiLineString':
      return 'timeline';
    case 'Polygon':
    case 'MultiPolygon':
      return 'change_history';
    case 'Point':
    case 'MultiPoint':
      return 'place';
    default:
      return 'layers';
  }
};

type LngLat = { lng: number; lat: number };

const coordinateForm: UIForm<LngLat> = [
  { id: 'lng', label: 'Longitude', type: 'number', className: 'col s12 m6' },
  { id: 'lat', label: 'Latitude', type: 'number', className: 'col s12 m6' },
];

const toLngLat = ([lng = 0, lat = 0]: Position): LngLat => ({ lng, lat });
const toPosition = ({ lng, lat }: LngLat): Position => [lng, lat];

const ringIsClosed = (ring: Position[]) =>
  ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];

/** ArrayLayoutForm edits an open ring (no repeated closing vertex); GeoJSON polygons require one. */
const openRing = (ring: Position[]): Position[] => (ringIsClosed(ring) ? ring.slice(0, -1) : ring);
const closeRing = (ring: Position[]): Position[] => (ring.length >= 3 ? [...ring, ring[0]] : ring);

const emptyFeatureCollection = (): FeatureCollection => ({ type: 'FeatureCollection', features: [] });

/** Accepts either a JSON-encoded string or a real GeoJSON object, and remembers which one it was. */
const readValue = (iv: unknown): { fc: FeatureCollection; isString: boolean } => {
  if (typeof iv === 'string') {
    if (!iv.trim()) return { fc: emptyFeatureCollection(), isString: true };
    try {
      return { fc: JSON.parse(iv) as FeatureCollection, isString: true };
    } catch {
      return { fc: emptyFeatureCollection(), isString: true };
    }
  }
  if (iv && typeof iv === 'object') {
    return { fc: iv as FeatureCollection, isString: false };
  }
  return { fc: emptyFeatureCollection(), isString: false };
};

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */

export const GeoJSONFeatureList = <O extends Attributes = {}>() => {
  const state = {} as {
    dom: HTMLUListElement;
    raw: string;
    view: string;
    /** Buffer for the raw-JSON textarea so an invalid edit-in-progress doesn't get clobbered by a re-render */
    rawText?: string;
    rawError?: string;
    /** When dealing with a large list, you may add a property filter */
    filterValue: string;
    newGeometryType: GeometryType;
  };

  return {
    oninit: ({ attrs: { i18n = {} } }) => {
      const { raw = 'RAW', view = 'VIEW' } = i18n;
      state.raw = raw;
      state.view = view;
      state.filterValue = '';
      state.newGeometryType = 'Point';
    },
    view: ({
      attrs: {
        field: { id = '', type, onSelect },
        obj,
        context,
        containerId,
        disabled,
        readonly,
        i18n,
        onchange,
      },
    }) => {
      if (obj instanceof Array) return;
      if (!type || typeof type === 'string') return;
      const form = type;
      const firstTypeId = form.length > 0 ? form[0].id : undefined;
      const isDisabled = disabled || readonly;

      const { fc: featureCollection, isString } = readValue(obj[id]);
      const features: Feature[] = featureCollection.features || [];

      const commit = (fc: FeatureCollection) => {
        obj[id] = (isString ? JSON.stringify(fc, null, 2) : fc) as any;
        state.rawText = undefined;
        state.rawError = undefined;
        onchange && onchange(obj);
      };

      const featureHeader = (feature: Feature) => {
        const geometryType = feature.geometry ? feature.geometry.type : 'Feature';
        const label = firstTypeId ? feature.properties?.[firstTypeId as string] : undefined;
        return { geometryType, label: label || geometryType };
      };

      const filter = state.filterValue.trim().toLowerCase();
      const isVisible = (feature: Feature) => {
        if (!filter) return true;
        const { label, geometryType } = featureHeader(feature);
        if (String(label).toLowerCase().includes(filter) || geometryType.toLowerCase().includes(filter)) return true;
        return Object.values(feature.properties || {}).some((v) => String(v).toLowerCase().includes(filter));
      };

      const addFeature = () => {
        const feature: Feature = {
          type: 'Feature',
          properties: {},
          geometry: defaultGeometry(state.newGeometryType),
        };
        commit({ ...featureCollection, type: 'FeatureCollection', features: [...features, feature] });
      };

      const deleteFeature = (i: number) => {
        commit({
          ...featureCollection,
          type: 'FeatureCollection',
          features: features.filter((_, idx) => idx !== i),
        });
      };

      const setGeometry = (i: number, geometry: Geometry) => {
        features[i] = { ...features[i], geometry };
        commit({ ...featureCollection, type: 'FeatureCollection', features });
      };

      const updateGeometryRaw = (i: number, text: string) => {
        try {
          setGeometry(i, JSON.parse(text) as Geometry);
        } catch {
          // Ignore invalid JSON while the user is still typing; nothing is committed.
        }
      };

      /**
       * A dedicated coordinate editor for the geometry types this component can create
       * (Point/LineString/Polygon), so users never have to hand-edit a coordinates array as
       * JSON. Anything else (MultiPoint, MultiLineString, MultiPolygon, GeometryCollection, a
       * missing/null geometry, ...) falls back to a raw JSON textarea.
       */
      const geometryEditor = (feature: Feature, i: number) => {
        const geometry = feature.geometry;
        if (!geometry) return undefined;

        if (geometry.type === 'Point') {
          const [lng = 0, lat = 0] = geometry.coordinates;
          return [
            m(NumberInput, {
              className: 'col s12 m6',
              label: 'Longitude',
              value: lng,
              disabled: isDisabled,
              onchange: (v: number) => setGeometry(i, { type: 'Point', coordinates: [v, lat] }),
            }),
            m(NumberInput, {
              className: 'col s12 m6',
              label: 'Latitude',
              value: lat,
              disabled: isDisabled,
              onchange: (v: number) => setGeometry(i, { type: 'Point', coordinates: [lng, v] }),
            }),
          ];
        }

        if (geometry.type === 'LineString') {
          const items = geometry.coordinates.map(toLngLat);
          return m(ArrayLayoutForm, {
            form: coordinateForm,
            items,
            label: 'Points',
            disabled: isDisabled,
            readonly: isDisabled,
            min: 2,
            compact: true,
            createItem: () => ({ lng: 0, lat: 0 }),
            onchange: (_valid: boolean, newItems?: LngLat[]) =>
              newItems && setGeometry(i, { type: 'LineString', coordinates: newItems.map(toPosition) }),
          } as IArrayLayoutForm<LngLat>);
        }

        if (geometry.type === 'Polygon') {
          const items = openRing(geometry.coordinates[0] ?? []).map(toLngLat);
          return m(ArrayLayoutForm, {
            form: coordinateForm,
            items,
            label: 'Vertices',
            disabled: isDisabled,
            readonly: isDisabled,
            min: 3,
            compact: true,
            createItem: () => ({ lng: 0, lat: 0 }),
            onchange: (_valid: boolean, newItems?: LngLat[]) =>
              newItems && setGeometry(i, { type: 'Polygon', coordinates: [closeRing(newItems.map(toPosition))] }),
          } as IArrayLayoutForm<LngLat>);
        }

        return m(TextArea, {
          class: 'col s12',
          label: `Geometry (${geometry.type}, raw GeoJSON)`,
          readOnly: isDisabled,
          defaultValue: JSON.stringify(geometry, null, 2),
          onchange: (v: string) => updateGeometryRaw(i, v),
        });
      };

      const rawTab = {
        title: state.raw,
        vnode: m('.row', [
          m(TextArea, {
            class: 'col s12',
            label: 'GeoJSON',
            readOnly: isDisabled,
            value: state.rawText ?? JSON.stringify(featureCollection, null, 2),
            placeholder: 'Enter a GeoJSON FeatureCollection',
            onchange: (v: string) => {
              state.rawText = v;
              try {
                const parsed = JSON.parse(v) as FeatureCollection;
                if (parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
                  throw new Error('Expected a GeoJSON object of type "FeatureCollection" with a "features" array');
                }
                commit(parsed);
              } catch (err) {
                state.rawError = err instanceof Error ? err.message : 'Invalid JSON';
              }
            },
          }),
          state.rawError ? m('.red-text.text-darken-2', state.rawError) : undefined,
        ]),
      } as TabItem;

      const visibleFeatures = features.map((feature, i) => ({ feature, i })).filter(({ feature }) => isVisible(feature));

      const viewTab = {
        title: `${state.view}${features.length ? ` (${features.length})` : ''}`,
        vnode: m('.row', [
          !isDisabled &&
            m('.col.s12.geojson-toolbar', { style: 'display:flex; gap:.5rem; align-items:center; margin-bottom:.5rem;' }, [
              m(
                '.geojson-toolbar-select',
                { style: 'width: 140px;' },
                m(Select<GeometryType>, {
                  label: 'New geometry',
                  options: geometryTypeOptions,
                  checkedId: state.newGeometryType,
                  onchange: ([v]) => (state.newGeometryType = v),
                })
              ),
              m(Button, {
                label: 'Add feature',
                iconName: 'add',
                onclick: addFeature,
              }),
              features.length > 1 &&
                m('input.geojson-filter[type=text]', {
                  placeholder: 'Filter features...',
                  value: state.filterValue,
                  style: 'flex: 1;',
                  oninput: (e: InputEvent) => (state.filterValue = (e.target as HTMLInputElement).value),
                }),
            ]),
          m(
            '.col.s12',
            features.length
              ? visibleFeatures.length
                ? m(Collapsible, {
                    oncreate: ({ dom }) => (state.dom = dom as HTMLUListElement),
                    onOpenStart: onSelect
                      ? (e: Element) => {
                          const children = state.dom.children || [];
                          for (let c = 0; c < children.length; c++) {
                            if (children[c] !== e) continue;
                            const idx = visibleFeatures[c]?.i;
                            if (idx !== undefined) onSelect(idx, features[idx]);
                            return;
                          }
                        }
                      : undefined,
                    className: 'geojson-feature-list',
                    items: visibleFeatures.map(({ feature, i }) => {
                      if (!feature.properties) feature.properties = {};
                      const { geometryType, label } = featureHeader(feature);
                      return {
                        id: `geojson-feature-${i}`,
                        key: i,
                        iconName: geometryIcon(geometryType),
                        header: m('.geojson-feature-header', { style: 'display:flex; align-items:center; gap:.5rem;' }, [
                          m('span', label),
                          m('span.grey-text', `(${geometryType})`),
                          !isDisabled &&
                            m(
                              '.right',
                              { style: 'margin-left:auto;' },
                              m(ConfirmButton, {
                                iconName: 'delete',
                                confirmIconName: 'check',
                                tooltip: 'Delete this feature',
                                onclick: (e: Event) => {
                                  e.stopPropagation();
                                  deleteFeature(i);
                                },
                              })
                            ),
                        ]),
                        body: m('.row', [
                          m(LayoutForm, {
                            class: 'col s12',
                            form,
                            obj: feature.properties! as any,
                            i18n,
                            context: context instanceof Array ? [obj, ...context] : [obj, context],
                            containerId,
                            disabled,
                            readonly,
                            onchange: (_: boolean, d: any) => {
                              if (d) features[i].properties = d;
                              commit({ ...featureCollection, type: 'FeatureCollection', features });
                            },
                          } as FormAttributes<any>),
                          m('h6.col.s12', { style: 'margin: 0.5rem 0;' }, 'Geometry'),
                          geometryEditor(feature, i),
                        ]),
                      };
                    }),
                  })
                : m('span.grey-text', 'No features match your filter.')
              : m('span.grey-text', 'No features yet. Use "Add feature" to create one.')
          ),
        ]),
      } as TabItem;

      return m(Tabs, { tabs: [viewTab, rawTab], tabWidth: 'fill' });
    },
  } as Component<IGeoJSONFeatureList<O>>;
};
