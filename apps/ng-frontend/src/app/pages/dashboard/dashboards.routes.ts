import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard-page').then((m) => m.DashboardPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile-page').then((m) => m.ProfilePage),
        title: 'My Profile',
      },
      {
        path: 'my-blogs',
        loadComponent: () =>
          import('./my-blogs/my-blogs-page').then((m) => m.MyBlogsPage),
        title: 'My Blogs',
      },
    ],
  },
];
