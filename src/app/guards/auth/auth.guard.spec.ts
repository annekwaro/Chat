import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { AuthGuard } from './auth.guard';

describe('AuthGuard (account required, e.g. Chat)', () => {
  const state = { url: '/tabs/home' } as RouterStateSnapshot;

  function setup(options: { uid: string | null; guest?: boolean }) {
    TestBed.configureTestingModule({
      providers: [...firebaseFakes(options).providers, provideRouter([])],
    });
    return TestBed.inject(AuthGuard);
  }

  it('lets people with an account through', async () => {
    expect(await setup({ uid: 'test-user' }).canActivate(undefined, state)).toBeTrue();
  });

  for (const [label, options] of [
    ['guests', { uid: 'guest-user', guest: true }],
    ['people with no session', { uid: null }],
  ] as const) {
    it(`sends ${label} to sign up, remembering where they were going`, async () => {
      const result = await setup(options).canActivate(undefined, state);
      expect(result instanceof UrlTree).toBeTrue();
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
        '/signup2?reason=chat&returnUrl=%2Ftabs%2Fhome'
      );
    });
  }
});
