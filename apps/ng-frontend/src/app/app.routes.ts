import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard.page';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage },
];
