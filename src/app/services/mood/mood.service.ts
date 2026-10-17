import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Mood {
  emoji: string;
  label: string;
  message: string;
  score: number; // 5 = great ... 1 = awful
  color: string; // the mood's colour in faces, charts and the calendar
  tint: string; // a soft background in the same colour
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD, also the document id
  mood: string;
  emoji: string;
  note?: string;
  with?: string[]; // who they were with, e.g. ['Family', 'Friends']
}

// "Who were you with?" choices in the check-in
export const COMPANY = ['Alone', 'Partner', 'Family', 'Friends', 'Coworkers', 'Classmates'];

export const MOODS: Mood[] = [
  { emoji: '😄', label: 'Great', score: 5, color: '#34c759', tint: '#e3f8e9', message: 'Love that! Keep the momentum going.' },
  { emoji: '🙂', label: 'Good', score: 4, color: '#7ccf95', tint: '#eaf7ee', message: 'Nice. A short meditation can keep you grounded.' },
  { emoji: '😐', label: 'Okay', score: 3, color: '#f7c948', tint: '#fff6d9', message: 'That is valid. Maybe try the emotional wheel in Explore.' },
  { emoji: '😔', label: 'Low', score: 2, color: '#f59e5b', tint: '#ffecde', message: 'Be gentle with yourself today. Talking helps.' },
  { emoji: '😢', label: 'Awful', score: 1, color: '#a78bfa', tint: '#f0ebff', message: 'You are not alone. Reaching out to someone can help.' },
];

// One check-in per day, stored at users/{uid}/moods/{YYYY-MM-DD}
@Injectable({ providedIn: 'root' })
export class MoodService {
  // Fires after any check-in change, so Home and the Mood diary stay in step
  readonly changed = new Subject<void>();

  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  dateKey(date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  findMood(label: string | undefined): Mood | null {
    return MOODS.find((m) => m.label === label) || null;
  }

  userId(): Promise<string | null> {
    return this.auth.getCurrentUserId();
  }

  private async moods() {
    const uid = await this.userId();
    if (!uid) throw new Error('not-logged-in');
    return this.afs.collection<MoodEntry>(`users/${uid}/moods`);
  }

  async getToday(): Promise<MoodEntry | null> {
    const snap = await (await this.moods()).doc(this.dateKey()).ref.get();
    return (snap.data() as MoodEntry) || null;
  }

  // Details left out are kept (merge), so a quick tap on Home doesn't wipe today's note
  async setToday(mood: Mood, details: { with?: string[]; note?: string } = {}): Promise<void> {
    const date = this.dateKey();
    const data: any = { date, mood: mood.label, emoji: mood.emoji, timestamp: new Date() };
    if (details.with !== undefined) data.with = details.with;
    if (details.note !== undefined) data.note = details.note;
    await (await this.moods()).doc(date).set(data, { merge: true });
    this.changed.next();
  }

  async clearToday(): Promise<void> {
    await (await this.moods()).doc(this.dateKey()).delete();
    this.changed.next();
  }

  async saveNote(date: string, note: string): Promise<void> {
    await (await this.moods()).doc(date).set({ note } as any, { merge: true });
    this.changed.next();
  }

  // Most recent entries first (a year by default, for the calendar)
  async getHistory(limit = 366): Promise<MoodEntry[]> {
    const col = await this.moods();
    const snap = await col.ref.orderBy('date', 'desc').limit(limit).get();
    return snap.docs.map((d) => d.data() as MoodEntry);
  }
}
