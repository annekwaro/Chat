import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private firestore: Firestore) {}
  docRef(path) {
    return doc(this.firestore, path);
  }
  setDocument(path, data) {
    const dataRef = this.docRef(path);
    return setDoc<any, any>(dataRef, data);
  }
  getDocById(path) {
    const dataRef = this.docRef(path);
    return getDoc(dataRef);
  }
}
