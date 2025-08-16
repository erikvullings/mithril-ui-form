import 'material-icons/iconfont/filled.css';
import 'mithril-materialized/index.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

// Set the language attribute on the html element to English.
document.documentElement.setAttribute('lang', 'en');

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
