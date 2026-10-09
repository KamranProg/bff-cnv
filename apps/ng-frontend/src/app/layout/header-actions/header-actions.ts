import { Component, computed, inject, Signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { AuthStore } from '../../core/auth/auth.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-actions',
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinnerModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
  ],
  templateUrl: './header-actions.html',
  styleUrl: './header-actions.scss',
})
export class HeaderActions {
  auth = inject(AuthStore);
  isLoggedIn: Signal<boolean> = computed(() => this.auth.isLoggedIn());
}
