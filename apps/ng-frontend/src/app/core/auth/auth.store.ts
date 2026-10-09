import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConvexService, CurrentUser } from '../convex/convex.service';

export type Me = { id: string; email: string; roles: string[] } | null;

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);
  private convex = inject(ConvexService);

  private _user = signal<Me>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  // Convex user row (name, avatar) — populated once ensureCurrentUser has run
  private _profile = signal<CurrentUser>(null);
  readonly profile = this._profile.asReadonly();
  readonly displayName = computed(() => {
    const p = this._profile();
    const name = [p?.firstName, p?.lastName].filter(Boolean).join(' ');
    return name || (p?.email ?? this._user()?.email ?? '');
  });
  readonly avatarUrl = computed(() => this._profile()?.imageUrl ?? null);

  /** Resolves once the initial GET /api/me has settled (used by guards) */
  readonly ready: Promise<void>;

  // guard so we only do ensure once per app runtime
  private ensuredOnce = signal(false);
  private unsubscribeProfile: (() => void) | null = null;

  // expose redirecting state so the Login button can show “Loading…”
  private _authRedirecting = signal(false);
  readonly authRedirecting = this._authRedirecting.asReadonly();

  constructor() {
    // 1) Discover session
    this.ready = firstValueFrom(
      this.http.get<Me>('/api/me', { withCredentials: true })
    ).then(
      (me) => this._user.set(me),
      () => this._user.set(null)
    );

    // 2) When logged in, init Convex auth and ensure Convex user exactly once
    effect(() => {
      if (this.isLoggedIn() && !this.ensuredOnce()) {
        this.convex.initAuth(); // sets setAuth(() => GET /api/convex-token)
        this.convex
          .ensureCurrentUser()
          .then(() => {
            this.unsubscribeProfile ??= this.convex.onCurrentUser((p) =>
              this._profile.set(p)
            );
          })
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

    this.unsubscribeProfile?.();
    this.unsubscribeProfile = null;
    this._profile.set(null);
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
