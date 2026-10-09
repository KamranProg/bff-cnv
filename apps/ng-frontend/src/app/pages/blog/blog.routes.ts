import { Routes } from '@angular/router';

export const blogRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog/blog-page').then((m) => m.BlogPage),
    title: 'Blog',
  },
  {
    path: ':blogId',
    loadComponent: () =>
      import('./blog-details/blog-details-page').then((m) => m.BlogDetailsPage),
    title: 'Blog Details',
  },
];
