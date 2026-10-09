import { Component, signal } from '@angular/core';
import { NavLink } from '../../shared/models/ui/nav-link';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-header-links',
  imports: [RouterLink, RouterLinkActive, TitleCasePipe, MatButton],
  templateUrl: './header-links.html',
  styleUrl: './header-links.scss',
})
export class HeaderLinks {
  links = signal<NavLink[]>([
    { text: 'About', path: '/about' },
    { text: 'Blog', path: '/blog' },
    { text: 'Dashboard', path: '/dashboard' },
  ]);
}
