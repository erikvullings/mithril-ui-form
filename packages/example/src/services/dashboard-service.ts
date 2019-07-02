import m, { ComponentTypes, RouteDefs } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { Layout } from '../components/layout';
import { Intro } from '../components/intro';
import { AboutPage } from '../components/about/about-page';
import { FormView } from '../components/form-view';

export const enum Dashboards {
  HOME = 'HOME',
  FORM = 'FORM',
  ABOUT = 'ABOUT',
}

class DashboardService {
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes, dashboards: IDashboard[]) {
    this.setList(dashboards);
  }

  public getList() {
    return this.dashboards;
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter(d => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public switchTo(dashboardId: Dashboards, fragment = '') {
    const dashboard = this.dashboards.filter(d => d.id === dashboardId).shift();
    if (dashboard) {
      m.route.set(dashboard.route);
    }
  }

  public get routingTable() {
    return this.dashboards.reduce(
      (p, c) => {
        p[c.route] = { render: () => m(this.layout, m(c.component)) };
        return p;
      },
      {} as RouteDefs
    );
  }
}

export const dashboardSvc: DashboardService = new DashboardService(Layout, [
  {
    id: Dashboards.HOME,
    default: true,
    title: 'HOME',
    icon: 'home',
    route: '/home',
    visible: true,
    component: Intro,
  },
  {
    id: Dashboards.FORM,
    title: 'PLAYGROUND',
    icon: 'edit',
    route: '/playground',
    visible: true,
    component: FormView,
  },
  {
    id: Dashboards.ABOUT,
    title: 'ABOUT',
    icon: 'info',
    route: '/about',
    visible: true,
    component: AboutPage,
  },
]);
