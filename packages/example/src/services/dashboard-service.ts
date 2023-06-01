import m, { ComponentTypes, RouteDefs } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { Layout } from '../components/layout';
import { Intro } from '../components/intro';
import { AboutPage } from '../components/about/about-page';
import { FormView } from '../components/form-view';
import { CreateForm } from '../components/create-form/create-form';
import { LLFView } from '../components/llf-test';

export const enum Dashboards {
  HOME = 'HOME',
  FORM = 'FORM',
  LLF = 'LLF',
  EDITOR = 'EDITOR',
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
    const dashboard = this.dashboards.filter((d) => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public switchTo(dashboardId: Dashboards, _fragment = '') {
    const dashboard = this.dashboards.filter((d) => d.id === dashboardId).shift();
    if (dashboard) {
      m.route.set(dashboard.route);
    }
  }

  public get routingTable() {
    return this.dashboards.reduce((p, c) => {
      p[c.route] = { render: () => m(this.layout, m(c.component)) };
      return p;
    }, {} as RouteDefs);
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
    id: Dashboards.LLF,
    title: 'LLF',
    route: '/llf',
    icon: 'assignment',
    visible: true,
    component: LLFView,
  },
  {
    id: Dashboards.EDITOR,
    title: 'EDITOR',
    icon: 'border_color',
    route: '/editor',
    visible: true,
    component: CreateForm,
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
