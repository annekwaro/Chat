import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';

export interface Mood {
  emoji: string;
  label: string;
  message: string;
  score: number; // 5 = great ... 1 = awful
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD, also the document id
  mood: string;
  emoji: string;
  note?: string;
}

export const MOODS: Mood[] = [
  { emoji: '😄', label: 'Great', score: 5, message: 'Love that! Keep the momentum going.' },
  { emoji: '🙂', label: 'Good', score: 4, message: 'Nice. A short meditation can keep you grounded.' },
  { emoji: '😐', label: 'Okay', score: 3, message: 'That is valid. Maybe try the emotional wheel in Explore.' },
  { emoji: '😔', label: 'Low', score: 2, message: 'Be gentle with yourself today. Talking helps.' },
  { emoji: '😢', label: 'Awful', score: 1, message: 'You are not alone. Consider reaching out to a therapist.' },
];

// One check-in per day, stored at users/{uid}/moods/{YYYY-MM-DD}
@Injectable({ providedIn: 'root' })
export class MoodService {
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

  async setToday(mood: Mood): Promise<void> {
    const date = this.dateKey();
    // merge so an existing note for today is kept
    await (await this.moods()).doc(date).set(
      { date, mood: mood.label, emoji: mood.emoji, timestamp: new Date() } as any,
      { merge: true }
    );
  }

  async clearToday(): Promise<void> {
    await (await this.moods()).doc(this.dateKey()).delete();
  }

  async saveNote(date: string, note: string): Promise<void> {
    await (await this.moods()).doc(date).set({ note } as any, { merge: true });
  }

  // Most recent entries first
  async getHistory(limit = 60): Promise<MoodEntry[]> {
    const col = await this.moods();
    const snap = await col.ref.orderBy('date', 'desc').limit(limit).get();
    return snap.docs.map((d) => d.data() as MoodEntry);
  }
}
