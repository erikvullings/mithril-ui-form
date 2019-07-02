import 'materialize-css/dist/css/materialize.min.css';
// import 'materialize-css/dist/js/materialize.min';
import 'material-icons/iconfont/material-icons.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
