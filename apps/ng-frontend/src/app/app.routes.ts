import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Eager (tiny, public)
  { path: 'home', component: HomePage, title: 'Home' },

  // Lazy components (public)
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about-page').then((m) => m.AboutPage),
    title: 'About',
  },
  {
    path: 'blog',
    loadChildren: () =>
      import('./pages/blog/blog.routes').then((m) => m.blogRoutes),
  },
  // Lazy route group (private area)
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboards.routes').then(
        (m) => m.dashboardRoutes
      ),
  },

  { path: '**', redirectTo: 'home' },
];
