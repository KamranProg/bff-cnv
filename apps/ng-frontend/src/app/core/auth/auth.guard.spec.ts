import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthStore, Me } from './auth.store';
import { provideAuthStoreMock } from './auth.store.mock';

describe('authGuard', () => {
  function run(user: Me) {
    TestBed.configureTestingModule({ providers: [provideAuthStoreMock(user)] });
    const auth = TestBed.inject(AuthStore);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as Route, [] as UrlSegment[])
    );
    return { result, auth };
  }

  it('allows signed-in users', async () => {
    const { result, auth } = run({ id: 'u1', email: 'a@b.co', roles: [] });
    await expect(result).resolves.toBe(true);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('blocks anonymous users and starts login', async () => {
    const { result, auth } = run(null);
    await expect(result).resolves.toBe(false);
    expect(auth.login).toHaveBeenCalled();
  });
});
