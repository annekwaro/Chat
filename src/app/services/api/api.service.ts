import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private afs: AngularFirestore) {}

  async setDocument(path: string, data: any) {
    return this.afs.doc(path).set(data);
  }

  async getDocById(path: string) {
    return this.afs.doc(path).get().toPromise();
  }

  async getCollection(path: string) {
    const snapshot = await this.afs.collection(path).get().toPromise();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as object) }));
  }
}
