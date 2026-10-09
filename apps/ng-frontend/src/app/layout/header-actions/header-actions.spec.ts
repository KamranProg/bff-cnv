import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderActions } from './header-actions';
import { AuthStore, Me } from '../../core/auth/auth.store';
import { provideAuthStoreMock } from '../../core/auth/auth.store.mock';

describe('HeaderActions', () => {
  function setup(user: Me) {
    TestBed.configureTestingModule({
      imports: [HeaderActions],
      providers: [provideRouter([]), provideAuthStoreMock(user)],
    });
    const fixture = TestBed.createComponent(HeaderActions);
    fixture.detectChanges();
    return {
      el: fixture.nativeElement as HTMLElement,
      auth: TestBed.inject(AuthStore),
    };
  }

  it('shows a sign-in button that starts login when signed out', () => {
    const { el, auth } = setup(null);
    const button = el.querySelector('button');
    expect(button?.textContent).toContain('Sign in');
    button?.click();
    expect(auth.login).toHaveBeenCalled();
  });

  it('shows the account menu trigger when signed in', () => {
    const { el } = setup({ id: 'u1', email: 'a@b.co', roles: ['user'] });
    expect(el.textContent).not.toContain('Sign in');
    expect(el.querySelector('[aria-label^="Account menu"]')).toBeTruthy();
  });
});
