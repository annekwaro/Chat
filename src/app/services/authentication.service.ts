import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private afAuth: AngularFireAuth) {}
  /**
   * Signs up a new user with email and password.
   * @param email User's email address.
   * @param password User's password.
   * @returns The user credential on successful sign-up.
   */
  async signUp(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  /**
   * Logs in a user with email and password.
   * @param email User's email address.
   * @param password User's password.
   * @returns The user credential on successful login.
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  /**
   * Signs out the currently logged-in user.
   */
  async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  /**
   * Gets the currently logged-in user.
   * @returns A promise resolving to the current user or null if not logged in.
   */
  getCurrentUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }
}
