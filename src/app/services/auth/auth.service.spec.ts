import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  function setup() {
    const fakes = firebaseFakes({ realAuthService: true });
    TestBed.configureTestingModule({ providers: fakes.providers });
    // AuthService listens to Firebase Auth directly: that needs a default (test) app and
    // AngularFire's zone schedulers, which the real AngularFire services normally create.
    // Nothing here touches the network.
    if (!getApps().length) {
      initializeApp({ apiKey: 'test-key', authDomain: 'test.firebaseapp.com', projectId: 'test', appId: '1:1:web:1' });
    }
    TestBed.inject(ɵAngularFireSchedulers);
    return {
      service: TestBed.inject(AuthService),
      afAuth: TestBed.inject(AngularFireAuth) as any,
      firestore: fakes.firestore,
    };
  }

  it('reports no user when nobody is signed in', async () => {
    const { service } = setup();
    expect(await service.getCurrentUserId()).toBeNull();
  });

  it('signs in with email and password', async () => {
    const { service, afAuth } = setup();
    await service.login('me@example.com', 'secret123');
    expect(afAuth.signInWithEmailAndPassword).toHaveBeenCalledWith('me@example.com', 'secret123');
  });

  it('creates a profile document when registering', async () => {
    const { service, firestore } = setup();
    await service.register({ email: 'new@example.com', password: 'secret123', username: 'New Person' });
    expect(firestore.data.get('users/new-user')).toEqual(
      jasmine.objectContaining({ uid: 'new-user', email: 'new@example.com', name: 'New Person' })
    );
    expect(service.getId()).toBe('new-user');
  });

  it('starts a guest session without any details', async () => {
    const { service, afAuth } = setup();
    expect(await service.continueAsGuest()).toBe('guest-user');
    expect(afAuth.signInAnonymously).toHaveBeenCalled();
    expect(service.isGuest()).toBeTrue();
    expect(await service.hasAccount()).toBeFalse();
  });

  it('upgrades a guest to an account, keeping the same user id', async () => {
    const { service, afAuth, firestore } = setup();
    await service.continueAsGuest();
    const linkWithCredential = jasmine
      .createSpy('linkWithCredential')
      .and.resolveTo({ user: { uid: 'guest-user' } });
    afAuth.currentUser = Promise.resolve({ isAnonymous: true, linkWithCredential });

    await service.register({ email: 'me@example.com', password: 'secret123', username: 'Me' });

    expect(linkWithCredential).toHaveBeenCalled();
    expect(afAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(firestore.data.get('users/guest-user')?.['email']).toBe('me@example.com');
    expect(service.isGuest()).toBeFalse();
    expect(await service.hasAccount()).toBeTrue();
  });

  it('forgets the user on logout', async () => {
    const { service, afAuth } = setup();
    await service.register({ email: 'new@example.com', password: 'secret123', username: 'N' });
    await service.logout();
    expect(afAuth.signOut).toHaveBeenCalled();
    expect(await service.getCurrentUserId()).toBeNull();
  });
});
