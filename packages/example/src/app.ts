import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import './styles.css';
import m, { RouteDefs } from 'mithril';
import { FormView } from './components/form-view';
import { Layout } from './components/layout';

const routingTable: RouteDefs = {
  '/': {
    render: () => m(Layout, m(FormView)),
  },
};

m.route(document.body, '/', routingTable);
