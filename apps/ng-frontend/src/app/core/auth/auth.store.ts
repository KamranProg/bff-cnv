import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConvexService } from '../convex/convex.service';

export type Me = { id: string; email: string; roles: string[] } | null;

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);
  private convex = inject(ConvexService);

  private _user = signal<Me>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  // guard so we only do ensure once per app runtime
  private ensuredOnce = signal(false);

  // expose redirecting state so the Login button can show “Loading…”
  private _authRedirecting = signal(false);
  readonly authRedirecting = this._authRedirecting.asReadonly();

  constructor() {
    // 1) Discover session
    this.http.get<Me>('/api/me', { withCredentials: true }).subscribe({
      next: (me) => this._user.set(me),
      error: () => this._user.set(null),
    });

    // 2) When logged in, init Convex auth and ensure Convex user exactly once
    effect(() => {
      if (this.isLoggedIn() && !this.ensuredOnce()) {
        this.convex.initAuth(); // sets setAuth(() => GET /api/convex-token)
        this.convex.ensureCurrentUser()
          .finally(() => this.ensuredOnce.set(true));
      }
    });
  }

  /** Navigate to BFF hosted login */
  login() {
    // show immediate feedback until the browser navigates to WorkOS
    this._authRedirecting.set(true);
    // full-page nav so the BFF can redirect to the hosted UI
    window.location.assign('/auth/login');
  }

  /** POST /auth/logout with CSRF and follow the 302 Location manually */
  async logout() {
    const csrf = getCookie('XSRF-TOKEN') ?? '';
    const res = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': csrf },
      redirect: 'manual',
    });

    const location = res.headers.get('Location');
    if (location) {
      window.location.assign(location);
      return;
    }

    this._user.set(null);
    this.ensuredOnce.set(false);
    this.router.navigateByUrl('/');
  }
}

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];
}
