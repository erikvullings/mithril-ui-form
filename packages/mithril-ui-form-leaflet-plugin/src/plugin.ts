import m from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { geoJSON } from 'leaflet';
import { GeometryObject, FeatureCollection } from 'geojson';
import { PluginType } from 'mithril-ui-form-plugin';
import L from 'leaflet';

// Fix for webpack/bundler compatibility - use URL strings instead of require()
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const leafletPlugin: PluginType<FeatureCollection> = () => {
  // Store map state to prevent layer duplication
  let mapInstance: { 
    layerGroup?: L.LayerGroup;
    lastFeatures?: FeatureCollection<GeometryObject>;
  } = {};
  
  return {
    view: ({ attrs: { props, iv, field, onchange } }) => {
      const id = props.id || 'map';
      const editable = props.disabled || props.readonly || field.readonly ? undefined : [id];
      const overlay = (iv ||
        field.value || {
          type: 'FeatureCollection',
          features: [],
        }) as FeatureCollection<GeometryObject>;
      
      // Only recreate overlay if features have actually changed
      const featuresChanged = !mapInstance.lastFeatures || 
        JSON.stringify(mapInstance.lastFeatures.features) !== JSON.stringify(overlay.features);
      
      let overlays = {} as Record<string, any>;
      
      if (featuresChanged || !mapInstance.layerGroup) {
        // Create new layer only when features change
        mapInstance.layerGroup = geoJSON(overlay);
        mapInstance.lastFeatures = { ...overlay };
        overlays[id] = mapInstance.layerGroup;
      } else {
        // Reuse existing layer
        overlays[id] = mapInstance.layerGroup;
      }
      return m(LeafletMap, {
        baseLayers: {
          osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
              subdomains: ['a', 'b', 'c'],
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            },
          },
        },
        className: 'col s12',
        style: 'height: 400px;',
        overlays,
        visible: [id],
        editable,
        autoFit: overlay && overlay.features && overlay.features.length > 0 ? true : false,
        view: overlay && overlay.features && overlay.features.length > 0 ? undefined : [52.0, 5.0], // Default center (Netherlands)
        zoom: overlay && overlay.features && overlay.features.length > 0 ? undefined : 8, // Default zoom level
        showScale: { imperial: false },
        onLayerEdited: (f) => {
          onchange && onchange(f.toGeoJSON() as any);
          m.redraw();
        },
      });
    },
  };
};
