import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { connectAuthEmulator, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserId: string | null = null;
  private guest = false; // signed in anonymously, no email/password yet
  private authChecked = false;
  private authResolve: ((value: string | null) => void) | null = null;
  public authReady = new Promise<string | null>((resolve) => {
    this.authResolve = resolve;
  });

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    // Use direct Firebase auth listener
    const auth = getAuth();
    if (environment.useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    onAuthStateChanged(auth, (user) => {
      this.currentUserId = user?.uid || null;
      this.guest = !!user?.isAnonymous;
      this.authChecked = true;
      console.log('🔐 onAuthStateChanged: user UID =', this.currentUserId);
      if (this.authResolve) {
        this.authResolve(this.currentUserId);
        this.authResolve = null;
      }
    });
  }

  // Waits for Firebase's first auth check, then always reflects the current user
  async getCurrentUserId(): Promise<string | null> {
    if (this.authChecked) return this.currentUserId;
    return this.authReady;
  }

  getId(): string | null {
    return this.currentUserId;
  }

  // True while using the app without an account
  isGuest(): boolean {
    return this.guest;
  }

  // Signed in with email/password (not a guest)
  async hasAccount(): Promise<boolean> {
    const uid = await this.getCurrentUserId();
    return !!uid && !this.guest;
  }

  // Starts a guest session so people can use the app without signing up.
  // Their data is kept when they create an account later (see register).
  async continueAsGuest(): Promise<string | null> {
    const res = await this.afAuth.signInAnonymously();
    this.currentUserId = res.user?.uid || null;
    this.guest = true;
    this.authChecked = true;
    return this.currentUserId;
  }

  // The signed-in user's profile document (users/{uid}), or null
  async getProfile(): Promise<{ name?: string; photo?: string; email?: string } | null> {
    const uid = await this.getCurrentUserId();
    if (!uid) return null;
    const snap = await this.afs.doc(`users/${uid}`).ref.get();
    return (snap.data() as any) || null;
  }

  async login(email: string, password: string) {
    try {
      const res = await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('✅ login success, user:', res.user?.uid);
      this.currentUserId = res.user?.uid || null;
      this.guest = false;
      this.authChecked = true;
      return res;
    } catch (err) {
      console.error('❌ login error:', err);
      throw err;
    }
  }

  async register(formValue: any) {
    // A guest keeps the same user id (and their diary, routine, etc.) by upgrading in place
    const current = await this.afAuth.currentUser;
    const res = current?.isAnonymous
      ? await current.linkWithCredential(
          firebase.auth.EmailAuthProvider.credential(formValue.email, formValue.password)
        )
      : await this.afAuth.createUserWithEmailAndPassword(formValue.email, formValue.password);
    const user = res.user;
    if (user) {
      await this.afs.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: formValue.email,
        name: formValue.username,
        photo: '', // no stock photo: the app shows initials until a real one is added
      });
      this.currentUserId = user.uid;
      this.guest = false;
      this.authChecked = true;
    }
    return res;
  }

  async logout() {
    await this.afAuth.signOut();
    this.currentUserId = null;
    this.guest = false;
  }
}
