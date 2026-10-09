import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { TitleCasePipe } from '@angular/common';
import { NavLink } from '../../../shared/models/ui/nav-link';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    TitleCasePipe,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  links = signal<NavLink[]>([
    { text: 'Profile', path: 'profile' },
    { text: 'My Blogs', path: 'my-blogs' },
  ]);
}
