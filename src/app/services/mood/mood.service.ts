import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Mood {
  key: string; // saved in Firestore (English, so older entries still match)
  emoji: string;
  label: string; // shown in the app
  message: string;
  score: number; // 5 = great ... 1 = awful
  color: string; // the mood's colour in faces, charts and the calendar
  tint: string; // a soft background in the same colour
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD, also the document id
  mood: string; // a Mood key, e.g. 'Great'
  emoji: string;
  note?: string;
  with?: string[]; // who they were with, as COMPANY keys, e.g. ['Family', 'Friends']
}

// "Who were you with?" choices in the check-in. Keys are saved, labels are shown.
export const COMPANY: { key: string; label: string }[] = [
  { key: 'Alone', label: 'Seul·e' },
  { key: 'Partner', label: 'Partenaire' },
  { key: 'Family', label: 'Famille' },
  { key: 'Friends', label: 'Amis' },
  { key: 'Coworkers', label: 'Collègues' },
  { key: 'Classmates', label: 'Camarades' },
];

export function companyLabel(key: string): string {
  return COMPANY.find((c) => c.key === key)?.label || key;
}

export const MOODS: Mood[] = [
  { key: 'Great', emoji: '😄', label: 'Super', score: 5, color: '#34c759', tint: '#e3f8e9', message: 'Génial\u00a0! Gardez cet élan.' },
  { key: 'Good', emoji: '🙂', label: 'Bien', score: 4, color: '#7ccf95', tint: '#eaf7ee', message: 'Très bien. Une courte méditation peut vous aider à garder ce cap.' },
  { key: 'Okay', emoji: '😐', label: 'Moyen', score: 3, color: '#f7c948', tint: '#fff6d9', message: 'C’est normal aussi. Essayez la roue des émotions dans Explorer.' },
  { key: 'Low', emoji: '😔', label: 'Pas top', score: 2, color: '#f59e5b', tint: '#ffecde', message: 'Prenez soin de vous aujourd’hui. En parler peut aider.' },
  { key: 'Awful', emoji: '😢', label: 'Très mal', score: 1, color: '#a78bfa', tint: '#f0ebff', message: 'Vous n’avez pas à vivre ça sans aide. Parler à quelqu’un peut aider.' },
];

// The French label for a saved mood key
export function moodLabel(key: string | undefined): string {
  return MOODS.find((m) => m.key === key)?.label || key || '';
}

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

  findMood(key: string | undefined): Mood | null {
    return MOODS.find((m) => m.key === key) || null;
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
    const data: any = { date, mood: mood.key, emoji: mood.emoji, timestamp: new Date() };
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
