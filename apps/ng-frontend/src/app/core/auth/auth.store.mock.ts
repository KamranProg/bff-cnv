import { computed, Provider, signal } from '@angular/core';
import { AuthStore, Me } from './auth.store';

/** Test double for AuthStore — avoids HTTP and Convex in component specs */
export function provideAuthStoreMock(user: Me = null): Provider {
  const userSignal = signal<Me>(user);
  return {
    provide: AuthStore,
    useValue: {
      user: userSignal.asReadonly(),
      isLoggedIn: computed(() => !!userSignal()),
      profile: signal(null).asReadonly(),
      displayName: computed(() => userSignal()?.email ?? ''),
      avatarUrl: signal<string | null>(null).asReadonly(),
      authRedirecting: signal(false).asReadonly(),
      ready: Promise.resolve(),
      login: jest.fn(),
      logout: jest.fn(),
    } satisfies Partial<AuthStore>,
  };
}
