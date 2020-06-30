import 'materialize-css/dist/css/materialize.min.css';
// import 'materialize-css/dist/js/materialize.min';
import 'material-icons/iconfont/material-icons.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
