import { Component, computed, inject, Signal } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav class="navbar">
      @if (!isLoggedIn()) {
      <button
        (click)="auth.login()"
        [disabled]="auth.authRedirecting()"
        [attr.aria-busy]="auth.authRedirecting() ? 'true' : null"
      >
        {{ auth.authRedirecting() ? 'Loading…' : 'Login' }}
      </button>
      } @else {
      <span>Hello, {{ auth.user()?.email }}</span>
      <button (click)="auth.logout()">Logout</button>
      }
    </nav>
  `,
})
export class NavbarComponent {
  auth = inject(AuthStore);
  isLoggedIn: Signal<boolean> = computed(() => this.auth.isLoggedIn());
}
