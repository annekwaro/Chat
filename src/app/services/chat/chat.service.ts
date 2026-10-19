import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LanguageService } from '../../i18n/language.service';

export const MAX_MESSAGE_LENGTH = 2000;

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

export interface ChatRoom {
  id?: string;
  participants: string[]; // the two user ids, sorted; the chat id is "uidA_uidB"
  participantNames: { [uid: string]: string };
  participantPhotos: { [uid: string]: string };
  lastMessage?: string;
  lastSenderId?: string;
  lastUpdated?: Date;
  readBy?: { [uid: string]: Date }; // when each person last opened the chat
  blockedBy?: string[]; // anyone listed here has blocked the chat: nobody can send
}

export type ReportReason = 'harassment' | 'spam' | 'hate' | 'risk' | 'other';

// Labels are chat.reasons.<value>
export const REPORT_REASONS: ReportReason[] = ['harassment', 'hate', 'spam', 'risk', 'other'];

export interface ChatUser {
  uid: string;
  name: string;
  photo?: string;
}

// Firestore returns Timestamps; the app works with Dates
export function toDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

// AngularFire bundles its own copy of rxjs, so wrap its streams in the app's Observable
// (unsubscribing still stops the Firestore listener)
function bridge<T>(source: {
  subscribe(observer: any): { unsubscribe(): void };
}): Observable<T> {
  return new Observable<T>((subscriber) => {
    const sub = source.subscribe(subscriber);
    return () => sub.unsubscribe();
  });
}

function toRoom(data: any): ChatRoom {
  const readBy: { [uid: string]: Date } = {};
  for (const [uid, value] of Object.entries(data.readBy || {})) {
    const date = toDate(value);
    if (date) readBy[uid] = date;
  }
  return {
    ...data,
    participantNames: data.participantNames || {},
    participantPhotos: data.participantPhotos || {},
    lastUpdated: toDate(data.lastUpdated),
    readBy,
    blockedBy: data.blockedBy || [],
  };
}

// One-to-one chats between people with an account.
// chats/{uidA_uidB} holds the participants and a preview; messages live in chats/{id}/messages.
@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private language: LanguageService,
  ) {}

  private async requireUid(): Promise<string> {
    const uid = await this.auth.getCurrentUserId();
    if (!uid) throw new Error('Not logged in');
    return uid;
  }

  chatIdFor(uidA: string, uidB: string): string {
    return [uidA, uidB].sort().join('_');
  }

  otherParticipant(room: ChatRoom, myUid: string | null): string {
    return room.participants.find((id) => id !== myUid) || '';
  }

  // A new message from the other person that I haven't opened yet
  isUnread(room: ChatRoom, myUid: string | null): boolean {
    if (
      !myUid ||
      !room.lastSenderId ||
      room.lastSenderId === myUid ||
      !room.lastUpdated
    )
      return false;
    const seen = room.readBy?.[myUid];
    return !seen || seen < room.lastUpdated;
  }

  isBlocked(room: ChatRoom): boolean {
    return !!room.blockedBy?.length;
  }

  blockedByMe(room: ChatRoom, myUid: string | null): boolean {
    return !!myUid && !!room.blockedBy?.includes(myUid);
  }

  // Blocking stops new messages in this chat (for both people) until I unblock
  async setBlocked(room: ChatRoom, blocked: boolean): Promise<void> {
    const uid = await this.requireUid();
    const others = (room.blockedBy || []).filter((id) => id !== uid);
    await this.afs
      .collection('chats')
      .doc(room.id)
      .update({ blockedBy: blocked ? [...others, uid] : others });
  }

  // Saved to `reports` for the team to review in the Firebase console. Nobody can read
  // a chat except its two people, so a copy of the recent messages goes with the report.
  async report(room: ChatRoom, reason: ReportReason, recent: Message[]): Promise<void> {
    const uid = await this.requireUid();
    await this.afs.collection('reports').add({
      chatId: room.id,
      reporterId: uid,
      reportedId: this.otherParticipant(room, uid),
      reason,
      messages: recent.slice(-20).map((m) => ({ text: m.text, senderId: m.senderId, timestamp: m.timestamp })),
      createdAt: new Date(),
    });
  }

  // My chats, most recent first. Sorted here rather than in the query, so Firestore
  // doesn't need a composite index for array-contains + orderBy.
  watchChatRooms(userId: string): Observable<ChatRoom[]> {
    return bridge<ChatRoom[]>(
      this.afs
        .collection<ChatRoom>('chats', (ref) =>
          ref.where('participants', 'array-contains', userId),
        )
        .valueChanges({ idField: 'id' }),
    ).pipe(
      map((rooms) =>
        rooms
          .map(toRoom)
          .sort(
            (a, b) =>
              (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0),
          ),
      ),
    );
  }

  watchRoom(chatId: string): Observable<ChatRoom | undefined> {
    return bridge<ChatRoom | undefined>(
      this.afs.doc<ChatRoom>(`chats/${chatId}`).valueChanges(),
    ).pipe(map((data) => (data ? { ...toRoom(data), id: chatId } : undefined)));
  }

  watchMessages(chatId: string): Observable<Message[]> {
    return bridge<Message[]>(
      this.afs
        .collection<Message>(`chats/${chatId}/messages`, (ref) =>
          ref.orderBy('timestamp', 'asc'),
        )
        .valueChanges({ idField: 'id' }),
    ).pipe(
      map((msgs) =>
        msgs.map((m) => ({
          ...m,
          timestamp: toDate(m.timestamp) || new Date(),
        })),
      ),
    );
  }

  // Everyone else with an account, by name
  async getUsers(): Promise<ChatUser[]> {
    const uid = await this.requireUid();
    const snap = await this.afs.collection('users').ref.get();
    return snap.docs
      .map((doc) => ({
        ...(doc.data() as any),
        uid: (doc.data() as any).uid || doc.id,
      }))
      .filter((u) => u.uid !== uid)
      .map((u) => ({
        uid: u.uid,
        name: u.name || this.language.translate('common.someone'),
        photo: u.photo || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Opens the chat with this person, creating it the first time
  async getOrCreateChatRoom(other: ChatUser): Promise<string> {
    const uid = await this.requireUid();
    const chatId = this.chatIdFor(uid, other.uid);
    const doc = this.afs.collection('chats').doc(chatId);
    const snap = await doc.ref.get();
    if (!snap.exists) {
      const me = (await this.auth.getProfile()) || {};
      await doc.set({
        participants: [uid, other.uid].sort(),
        participantNames: {
          [uid]: me.name || '', // shown as "Someone" in the reader's language
          [other.uid]: other.name,
        },
        participantPhotos: {
          [uid]: me.photo || '',
          [other.uid]: other.photo || '',
        },
        lastUpdated: new Date(),
        readBy: { [uid]: new Date() },
      });
    }
    return chatId;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const senderId = await this.requireUid();
    const body = text.trim();
    if (!body) return;
    if (body.length > MAX_MESSAGE_LENGTH)
      throw new Error('Message is too long');
    const now = new Date();
    await this.afs
      .collection(`chats/${chatId}/messages`)
      .add({ text: body, senderId, timestamp: now });
    await this.afs
      .collection('chats')
      .doc(chatId)
      .update({
        lastMessage: body,
        lastSenderId: senderId,
        lastUpdated: now,
        [`readBy.${senderId}`]: now,
      });
  }

  async markRead(chatId: string): Promise<void> {
    const uid = await this.requireUid();
    await this.afs
      .collection('chats')
      .doc(chatId)
      .update({ [`readBy.${uid}`]: new Date() });
  }
}
