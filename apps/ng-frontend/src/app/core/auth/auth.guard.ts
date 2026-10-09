import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * Allows the route only for signed-in users. Waits for the initial
 * GET /api/me to settle; anonymous users are sent to the hosted login,
 * which returns them to /dashboard after the callback.
 */
export const authGuard: CanMatchFn = async () => {
  const auth = inject(AuthStore);
  await auth.ready;

  if (auth.isLoggedIn()) return true;

  auth.login();
  return false;
};
