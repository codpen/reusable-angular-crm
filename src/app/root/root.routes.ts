import {AboutComponent} from '../about';
import {RootComponent} from './root.component';
// import { HomeComponent } from './home.component';
import {DashboardComponent} from '../dashboard';
import {CustomerListComponent} from '../customer';
import {AuthGuard} from '../_guard';
import {ErrorPageComponent} from '../errorpage';

export const routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      }, {
        path: 'about',
        component: AboutComponent
      }, {
        path: 'customer',
        component: CustomerListComponent
      }
    ]
  }
];
