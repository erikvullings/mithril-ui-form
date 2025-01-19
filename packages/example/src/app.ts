import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';
import 'material-icons/iconfont/filled.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

// Set the language attribute on the html element to English.
document.documentElement.setAttribute('lang', 'en');

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
