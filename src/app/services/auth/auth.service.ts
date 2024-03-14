import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ApiService } from '../api/api.service';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public _uid = new BehaviorSubject<any>(null);
  currentUser: any;

  constructor(private fireAuth: Auth, private apiService: ApiService) {}

  // async and await logic with password and email

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await signInWithEmailAndPassword(
        this.fireAuth,
        email,
        password
      );
      console.log(response);
      if (response?.user) {
        this.setUserData(response.user.uid); // Add this line
        // return user data
      }
    } catch (e) {
      throw e;
    }
  }

  setUserData(uid: string) {
    this._uid.next(uid);
    this.currentUser = this.fireAuth.currentUser;
  }
  get Id() {
    //another method
    const auth = getAuth();
    this.currentUser = auth.currentUser;
    console.log(this.currentUser);
    return this.currentUser.uid;
  }
  async register(formValue) {
    const registeredUser = await createUserWithEmailAndPassword(
      this.fireAuth,
      formValue.email,
      formValue.password
    );
    console.log('registered user', registeredUser);
    const data = {
      email: formValue.email,
      name: formValue.name,
      uid: registeredUser.user.uid,
      photo: 'https://i.pravatar.cc/',
    };
    await this.apiService.setDocument(`users/${registeredUser.user.uid}`, data);
    const userData = {
      id: registeredUser.user.uid,
    };
    return userData;
  }
  catch(e) {
    throw e;
  }
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.fireAuth, email);
    } catch (e) {
      throw e;
    }
  }

  async logOut() {
    try {
      await this.fireAuth.signOut();
      return true;
    } catch (e) {
      throw e;
    }
  }
  checkAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.fireAuth, (user) => {
        console.log('auth user:', user);
        resolve(user);
      });
    });
  }

  async getUserData(id) {
    const docSnap: any = await this.apiService.getDocById(` users/${id}`);
    if (docSnap?.exists()) {
      return docSnap.data();
    } else {
      throw 'No such document exists';
    }
  }
}
