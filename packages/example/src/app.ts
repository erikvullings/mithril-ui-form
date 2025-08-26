import 'material-icons/iconfont/filled.css';
import 'mithril-materialized/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

import { registerPlugin } from 'mithril-ui-form';
import { leafletPlugin } from 'mithril-ui-form-leaflet-plugin';
import { ratingPlugin } from 'mithril-ui-form-rating-plugin';

registerPlugin('map', leafletPlugin);
registerPlugin('rating', ratingPlugin);

// Set the language attribute on the html element to English.
document.documentElement.setAttribute('lang', 'en');

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
