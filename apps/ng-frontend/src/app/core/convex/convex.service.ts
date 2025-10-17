import { Injectable } from '@angular/core';
import { ConvexClient } from 'convex/browser';
import { api } from '@bff-cnv/convex';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConvexService {
  private client = new ConvexClient(environment.NG_APP_CONVEX_URL);
  private authInitialized = false;

  /** Idempotent: safe to call multiple times */
  initAuth(): void {
    if (this.authInitialized) return;
    this.authInitialized = true;

    const endpoint =
      environment.NG_APP_CONVEX_TOKEN_ENDPOINT ?? '/api/convex-token';

    const fetchTokenOnce = async (): Promise<string | null> => {
      const res = await fetch(endpoint, { credentials: 'include' });
      if (!res.ok) return null;

      // Cast to a tiny shape; then validate at runtime
      const data = (await res.json()) as { token?: unknown };
      return typeof data.token === 'string' ? data.token : null;
    };

    this.client.setAuth(async () => {
      // 1) try with current session cookie
      let token = await fetchTokenOnce();
      if (token) return token;

      // 2) if 401/failed, try refresh cookie via /api/me, then retry
      await fetch('/api/me', { credentials: 'include' });
      token = await fetchTokenOnce();

      return token; // may be null; Convex will stay unauthenticated if so
    });
  }

  ensureCurrentUser() {
    return this.client.mutation(api.users.ensureCurrentUser, {});
  }

  get convex() {
    return this.client;
  }
}
