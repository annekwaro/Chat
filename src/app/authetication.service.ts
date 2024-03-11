import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Injectable({
  providedIn: 'root',
})
//This is auth from firebase where it takes email and password as string
export class AutheticationService {
  constructor(public ngFireAuth: AngularFireAuth) {}
  async registerUser(email: string, password: string) {
    return await this.ngFireAuth.createUserWithEmailAndPassword(
      email,
      password
    );
  }
  //function for getting user from firebase
  async loginUser(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }
  //function for signout user from firebase
  async signOut() {
    return await this.ngFireAuth.signOut();
  }

  //function to reset password
  async resetPassword(email: string, password: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }

  async getProfile() {
    return await this.ngFireAuth.currentUser;
  }
}
