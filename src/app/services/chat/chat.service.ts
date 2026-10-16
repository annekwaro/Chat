import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

export interface ChatRoom {
  id?: string;
  participants: string[];
  participantNames: { [uid: string]: string };
  participantPhotos: { [uid: string]: string };
  lastMessage?: string;
  lastUpdated?: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  getUserChatRooms(userId: string): Observable<ChatRoom[]> {
    const subj = new BehaviorSubject<ChatRoom[]>([]);
    this.afs
      .collection<ChatRoom>('chats', (ref) =>
        ref
          .where('participants', 'array-contains', userId)
          .orderBy('lastUpdated', 'desc')
      )
      .valueChanges({ idField: 'id' })
      .subscribe((rooms) => subj.next(rooms));
    return subj.asObservable();
  }

  async getOrCreateChatRoom(
    otherUserId: string,
    otherName: string,
    otherPhoto: string
  ): Promise<string> {
    const currentUid = this.auth.getId();
    if (!currentUid) throw new Error('Not logged in');
    const chatId = [currentUid, otherUserId].sort().join('_');
    const docRef = this.afs.collection('chats').doc(chatId);
    const docSnap = await docRef.get().toPromise();
    if (!docSnap.exists) {
      await docRef.set({
        participants: [currentUid, otherUserId],
        participantNames: { [otherUserId]: otherName },
        participantPhotos: { [otherUserId]: otherPhoto },
        lastUpdated: new Date(),
      });
    }
    return chatId;
  }

  getMessages(chatId: string): Observable<Message[]> {
    const subj = new BehaviorSubject<Message[]>([]);
    this.afs
      .collection<Message>(`chats/${chatId}/messages`, (ref) =>
        ref.orderBy('timestamp', 'asc')
      )
      .valueChanges({ idField: 'id' })
      .subscribe((msgs) => subj.next(msgs));
    return subj.asObservable();
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const senderId = this.auth.getId();
    if (!senderId) throw new Error('Not logged in');
    await this.afs.collection(`chats/${chatId}/messages`).add({
      text,
      senderId,
      timestamp: new Date(),
    });
    await this.afs.collection('chats').doc(chatId).update({
      lastMessage: text,
      lastUpdated: new Date(),
    });
  }
}
