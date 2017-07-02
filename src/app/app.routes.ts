import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AboutComponent } from './about';
import { ErrorPageComponent } from './errorpage';

import { CustomerListComponent } from './customer';
import { RootComponent } from './root';
import { LoginComponent } from './login';
import { AuthGuard } from './_guard';

export const ROUTES: Routes = [  
  { path: '', component: RootComponent, canActivate: [AuthGuard]}, 
  { path: 'root', component: RootComponent}, 
  { path: 'login', component:RootComponent},
  { path: '**',    component: ErrorPageComponent, canActivate: [AuthGuard]},
];
