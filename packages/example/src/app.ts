import 'material-icons/iconfont/filled.css';
import 'mithril-materialized/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'mithril-markdown-wysiwyg/style.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

import { registerPlugin } from 'mithril-ui-form';
import { leafletPlugin } from 'mithril-ui-form-leaflet-plugin';
import { ratingPlugin } from 'mithril-ui-form-rating-plugin';
import { markdownEditorPlugin, markdownReadonlyPlugin } from 'mithril-ui-form-markdown-plugin';

registerPlugin('map', leafletPlugin);
registerPlugin('custom-rating', ratingPlugin);
// Registered under a distinct type name (not 'md') so the many existing static/decorative
// `type: 'md'` blocks elsewhere in this example app (headers, instructions - most without an
// `id`) keep rendering as plain static HTML; only forms that opt into `type: 'md-editor'` get
// the interactive WYSIWYG editor. A real consumer who wants every 'md' field to be editable
// would register this under 'md' instead - see mithril-ui-form-markdown-plugin's README.
registerPlugin('md-editor', markdownEditorPlugin, markdownReadonlyPlugin);

// Set the language attribute on the html element to English.
document.documentElement.setAttribute('lang', 'en');

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
