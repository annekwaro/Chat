import { TestBed } from '@angular/core/testing';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { SessionGuard } from './session.guard';

describe('SessionGuard (the app is open to everyone)', () => {
  function setup(uid: string | null) {
    const fakes = firebaseFakes({ uid });
    TestBed.configureTestingModule({ providers: fakes.providers });
    return { guard: TestBed.inject(SessionGuard), auth: fakes.auth };
  }

  it('keeps an existing session', async () => {
    const { guard, auth } = setup('test-user');
    expect(await guard.canActivate()).toBeTrue();
    expect(auth.continueAsGuest).not.toHaveBeenCalled();
  });

  it('starts a guest session when there is none', async () => {
    const { guard, auth } = setup(null);
    expect(await guard.canActivate()).toBeTrue();
    expect(auth.continueAsGuest).toHaveBeenCalled();
    expect(auth.isGuest()).toBeTrue();
  });

  it('still lets people in if a guest session cannot start', async () => {
    const { guard, auth } = setup(null);
    auth.continueAsGuest.and.rejectWith(new Error('auth/operation-not-allowed'));
    spyOn(console, 'warn');
    expect(await guard.canActivate()).toBeTrue();
  });
});
