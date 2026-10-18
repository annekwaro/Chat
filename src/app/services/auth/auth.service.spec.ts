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

  it('creates a public profile without the email, and keeps the email private', async () => {
    const { service, firestore } = setup();
    await service.register({ email: 'new@example.com', password: 'secret123', username: 'New Person' });
    expect(firestore.data.get('users/new-user')).toEqual({ uid: 'new-user', name: 'New Person', photo: '' });
    expect(firestore.data.get('users/new-user/private/account')).toEqual({ email: 'new@example.com' });
    expect(service.getId()).toBe('new-user');
  });

  it('moves an older account’s email out of the public profile on login', async () => {
    const { service, firestore } = setup();
    firestore.data.set('users/test-user', { uid: 'test-user', name: 'Old', email: 'old@example.com', photo: 'p.png' });
    await service.login('old@example.com', 'secret123');
    expect(firestore.data.get('users/test-user')).toEqual({ uid: 'test-user', name: 'Old', photo: 'p.png' });
    expect(firestore.data.get('users/test-user/private/account')).toEqual({ email: 'old@example.com' });
  });

  it('sends a password reset without revealing whether the email exists', async () => {
    const { service, afAuth } = setup();
    afAuth.sendPasswordResetEmail = jasmine
      .createSpy('sendPasswordResetEmail')
      .and.rejectWith({ code: 'auth/user-not-found' });
    await expectAsync(service.sendPasswordReset('nobody@example.com')).toBeResolved();
    afAuth.sendPasswordResetEmail.and.rejectWith({ code: 'auth/network-request-failed' });
    await expectAsync(service.sendPasswordReset('me@example.com')).toBeRejected();
  });

  it('starts a guest session without any details', async () => {
    const { service, afAuth } = setup();
    expect(await service.continueAsGuest()).toBe('guest-user');
    expect(afAuth.signInAnonymously).toHaveBeenCalled();
    expect(service.isGuest()).toBeTrue();
    expect(await service.hasAccount()).toBeFalse();
  });

  it('turns a guest into an account and brings their diary and routine along', async () => {
    const { service, afAuth, firestore } = setup();
    await service.continueAsGuest();
    const linkWithCredential = jasmine.createSpy('linkWithCredential');
    afAuth.currentUser = Promise.resolve({ uid: 'guest-user', isAnonymous: true, linkWithCredential });
    firestore.data.set('users/guest-user/moods/2026-10-17', { date: '2026-10-17', mood: 'Good', note: 'Walk' });
    firestore.data.set('users/guest-user/routine/2026-10-17', { date: '2026-10-17', items: [] });

    await service.register({ email: 'me@example.com', password: 'secret123', username: 'Me' });

    // linkWithCredential is refused when email enumeration protection is on
    expect(linkWithCredential).not.toHaveBeenCalled();
    expect(afAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith('me@example.com', 'secret123');
    expect(firestore.data.get('users/new-user/moods/2026-10-17')).toEqual({ date: '2026-10-17', mood: 'Good', note: 'Walk' });
    expect(firestore.data.get('users/new-user/routine/2026-10-17')).toEqual({ date: '2026-10-17', items: [] });
    expect(firestore.data.get('users/new-user/private/account')?.['email']).toBe('me@example.com');
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
