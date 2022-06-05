import m from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { geoJSON } from 'leaflet';
import { GeometryObject, FeatureCollection } from 'geojson';
import { PluginType } from 'mithril-ui-form';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const leafletPlugin: PluginType = () => {
  return {
    view: ({ attrs: { props, iv, field, onchange } }) => {
      const id = props.id || '';
      const editable = props.disabled || props.readonly || field.readonly ? undefined : [id];
      const overlay = (iv ||
        field.value || {
          type: 'FeatureCollection',
          features: [],
        }) as FeatureCollection<GeometryObject>;
      const overlays = {} as Record<string, any>;
      overlays[id] = geoJSON(overlay);
      // console.log(overlays);
      return m(LeafletMap, {
        baseLayers: {
          osm: {
            url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            options: {
              subdomains: ['a', 'b'],
              attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
              maxNativeZoom: 17,
            },
          },
        },
        className: 'col s12',
        style: 'height: 400px;',
        overlays,
        visible: [id],
        editable,
        autoFit: true,
        showScale: { imperial: false },
        onLayerEdited: (f) => {
          onchange && onchange(f.toGeoJSON() as any);
          m.redraw();
        },
      });
    },
  };
};
