import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AlertController,
  ItemReorderEventDetail,
  ToastController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { COMPANY, MOODS, Mood, MoodEntry, MoodService } from '../services/mood/mood.service';
import { CheckInService } from '../components/check-in/check-in.service';
import { currentLocale } from 'src/app/locale';
import { LanguageService } from '../i18n/language.service';
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';

type Segment = 'diary' | 'learn' | 'calm';

// Text: conditions.<id> (name, summary, signs, helps)
interface Condition {
  id: string;
  image: string;
  color: string;
}

interface DayCell {
  key: string;
  date: Date;
  day: number;
  isToday: boolean;
  entry?: MoodEntry;
  mood?: Mood | null;
  height?: number; // bar height in the weekly chart, as a percentage
}

// The suggested activities are saved with a key and shown in the current language
// (routine.items.<key>); activities people add are saved with their name.
interface RoutineItem {
  key?: string;
  name: string;
  image: string;
  done: boolean;
}

const DEFAULT_ROUTINE: RoutineItem[] = [
  { key: 'meditation', name: '', image: 'assets/imgs/image7.png', done: false },
  { key: 'breathing', name: '', image: 'assets/imgs/image8.png', done: false },
  { key: 'cycling', name: '', image: 'assets/imgs/image24.png', done: false },
  { key: 'reading', name: '', image: 'assets/imgs/image4.png', done: false },
  { key: 'music', name: '', image: 'assets/imgs/image5.png', done: false },
];

// Routines saved by older versions have the suggested activities by name, in French or English
const SUGGESTED_BY_NAME = new Map<string, string>();
for (const lang of [fr, en]) {
  for (const [key, name] of Object.entries(lang.routine.items)) SUGGESTED_BY_NAME.set(name, key);
}

export function withKeys(items: RoutineItem[]): RoutineItem[] {
  return items.map((i) => {
    const key = i.key || SUGGESTED_BY_NAME.get(i.name);
    return key ? { key, name: '', image: i.image, done: !!i.done } : i;
  });
}

// Box breathing: 4 seconds per phase (labels: calm.phase.<key>)
const BREATH_PHASES = [
  { key: 'in', scale: 1 },
  { key: 'hold', scale: 1 },
  { key: 'out', scale: 0.6 },
  { key: 'hold', scale: 0.6 },
];
const PHASE_SECONDS = 4;

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit, OnDestroy {
  segment: Segment = 'learn';

  // Mood diary
  moods = MOODS;
  loggedIn = true;
  loadingDiary = true;
  history: MoodEntry[] = [];
  today: MoodEntry | null = null;
  week: DayCell[] = [];
  streak = 0;
  monthCount = 0;
  historyView: 'list' | 'calendar' = 'list';
  calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  calendar: (DayCell | null)[] = [];
  private moodSub?: Subscription;

  // Learn
  conditions: Condition[] = [
    { id: 'anxiety', image: 'assets/imgs/image30.png', color: '#ffe8de' },
    { id: 'depression', image: 'assets/imgs/image22.png', color: '#e3ebff' },
    { id: 'low-mood', image: 'assets/imgs/image8.png', color: '#fff4cc' },
    { id: 'self-esteem', image: 'assets/imgs/image37.png', color: '#dff7e3' },
    { id: 'ocd', image: 'assets/imgs/image28.png', color: '#ece3ff' },
    { id: 'schizophrenia', image: 'assets/imgs/image23.png', color: '#ffe3ec' },
  ];
  selectedCondition: Condition | null = null;

  // Calm: breathing
  breathing = false;
  phaseIndex = 0;
  countdown = PHASE_SECONDS;
  cycles = 0;
  private breathTimer: any = null;

  // Calm: routine
  routine: RoutineItem[] = [];
  newRoutineItem = '';
  private uid: string | null = null;

  constructor(
    private moodService: MoodService,
    private afs: AngularFirestore,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private checkIn: CheckInService,
    private language: LanguageService
  ) {}

  ngOnInit() {
    // Check-ins from the "+" button or Home
    this.moodSub = this.moodService.changed.subscribe(() => this.loadDiary());
  }

  async ionViewWillEnter() {
    // Home's shortcuts link straight to a section, e.g. ?segment=calm
    const segment = this.route.snapshot?.queryParamMap?.get('segment') as Segment | null;
    if (segment && ['diary', 'learn', 'calm'].includes(segment)) {
      this.segment = segment;
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
    this.uid = await this.moodService.userId();
    this.loggedIn = !!this.uid;
    await Promise.all([this.loadDiary(), this.loadRoutine()]);
  }

  ionViewWillLeave() {
    this.stopBreathing();
  }

  ngOnDestroy() {
    this.stopBreathing();
    this.moodSub?.unsubscribe();
  }

  // ---------- Mood diary ----------

  private async loadDiary() {
    this.loadingDiary = true;
    if (this.loggedIn) {
      try {
        this.history = await this.moodService.getHistory();
      } catch (err) {
        console.error('Failed to load mood history', err);
        this.history = [];
      }
    } else {
      this.history = [];
    }
    const todayKey = this.moodService.dateKey();
    this.today = this.history.find((e) => e.date === todayKey) || null;
    this.buildWeek();
    this.buildCalendar();
    this.streak = this.calcStreak();
    const month = todayKey.slice(0, 7);
    this.monthCount = this.history.filter((e) => e.date.startsWith(month)).length;
    this.loadingDiary = false;
  }

  private buildWeek() {
    const byDate = new Map(this.history.map((e) => [e.date, e]));
    const days: DayCell[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = this.moodService.dateKey(d);
      days.push({
        key,
        date: d,
        day: d.getDate(),
        isToday: i === 0,
        entry: byDate.get(key),
        mood: this.moodFor(byDate.get(key)),
      });
    }
    // Great fills the chart; an empty day still shows a short grey bar
    for (const day of days) day.height = day.mood ? 30 + day.mood.score * 14 : 22;
    this.week = days;
  }

  private buildCalendar() {
    const byDate = new Map(this.history.map((e) => [e.date, e]));
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const todayKey = this.moodService.dateKey();
    const cells: (DayCell | null)[] = Array(leading).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const key = this.moodService.dateKey(new Date(year, month, day));
      const entry = byDate.get(key);
      cells.push({ key, date: new Date(year, month, day), day, isToday: key === todayKey, entry, mood: this.moodFor(entry) });
    }
    this.calendar = cells;
  }

  get calendarTitle(): string {
    return this.calendarMonth.toLocaleDateString(currentLocale(), { month: 'long', year: 'numeric' });
  }

  // Calendar weeks start on Monday: L M M J V S D / M T W T F S S (1 January 2024 was a Monday)
  get calendarWeekdays(): string[] {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => new Date(2024, 0, 1 + i).toLocaleDateString(currentLocale(), { weekday: 'narrow' }));
  }

  weekday(date: Date): string {
    return date.toLocaleDateString(currentLocale(), { weekday: 'short' });
  }

  get canGoForward(): boolean {
    const now = new Date();
    return this.calendarMonth < new Date(now.getFullYear(), now.getMonth(), 1);
  }

  changeMonth(step: number) {
    if (step > 0 && !this.canGoForward) return;
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + step, 1);
    this.buildCalendar();
  }

  openDay(cell: DayCell | null) {
    if (cell?.entry) this.editNote(cell.entry);
    else if (cell?.isToday) this.openCheckIn();
  }

  // Consecutive days with a check-in, counting back from today (or yesterday if today isn't logged yet)
  private calcStreak(): number {
    const dates = new Set(this.history.map((e) => e.date));
    const d = new Date();
    if (!dates.has(this.moodService.dateKey(d))) d.setDate(d.getDate() - 1);
    let count = 0;
    while (dates.has(this.moodService.dateKey(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  moodName(key: string | undefined): string {
    return this.moodService.findMood(key) ? this.t(`moods.${key}.label`) : key || '';
  }

  companyNames(keys: string[] | undefined): string {
    return (keys || []).map((k) => this.companyName(k)).join(', ');
  }

  companyName(key: string): string {
    return COMPANY.includes(key) ? this.t(`company.${key}`) : key;
  }

  moodFor(entry: MoodEntry | null | undefined): Mood | null {
    return this.moodService.findMood(entry?.mood);
  }

  formatDate(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (key === this.moodService.dateKey()) return this.t('diary.today');
    return date.toLocaleDateString(currentLocale(), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  // Today's check-in sheet (mood, who you were with, note); the diary reloads when it's saved
  openCheckIn() {
    this.checkIn.open(this.today);
  }

  async editNote(entry: MoodEntry) {
    const alert = await this.alertCtrl.create({
      header: this.formatDate(entry.date),
      subHeader: this.moodName(entry.mood),
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: this.t('diary.notePlaceholder'),
          value: entry.note || '',
        },
      ],
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        {
          text: this.t('common.save'),
          handler: async (data) => {
            try {
              await this.moodService.saveNote(entry.date, (data.note || '').trim());
            } catch (err) {
              console.error('Failed to save note', err);
              this.showToast(this.t('diary.noteFailed'));
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ---------- Learn ----------

  openCondition(condition: Condition) {
    this.selectedCondition = condition;
  }

  closeCondition() {
    this.selectedCondition = null;
  }

  talkToTherapist() {
    this.closeCondition();
    this.router.navigate(['/', 'tabs', 'home']);
  }

  // ---------- Calm: breathing ----------

  get phase() {
    return BREATH_PHASES[this.phaseIndex];
  }

  get phaseLabel(): string {
    return this.t(`calm.phase.${this.phase.key}`);
  }

  get circleScale(): number {
    return this.breathing ? this.phase.scale : 0.6;
  }

  toggleBreathing() {
    this.breathing ? this.stopBreathing() : this.startBreathing();
  }

  private startBreathing() {
    this.breathing = true;
    this.phaseIndex = 0;
    this.countdown = PHASE_SECONDS;
    this.cycles = 0;
    this.breathTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.phaseIndex = (this.phaseIndex + 1) % BREATH_PHASES.length;
        if (this.phaseIndex === 0) this.cycles++;
        this.countdown = PHASE_SECONDS;
      }
    }, 1000);
  }

  private stopBreathing() {
    clearInterval(this.breathTimer);
    this.breathTimer = null;
    this.breathing = false;
  }

  // ---------- Calm: routine ----------
  // One list per day at users/{uid}/routine/{YYYY-MM-DD}; a new day starts from the last list, unticked

  get doneCount(): number {
    return this.routine.filter((i) => i.done).length;
  }

  private routineCol() {
    return this.afs.collection(`users/${this.uid}/routine`);
  }

  private async loadRoutine() {
    if (!this.uid) {
      if (!this.routine.length) this.routine = DEFAULT_ROUTINE.map((i) => ({ ...i }));
      return;
    }
    try {
      const today = await this.routineCol().doc(this.moodService.dateKey()).ref.get();
      if (today.exists) {
        this.routine = withKeys((today.data() as any).items);
        return;
      }
      const last = await this.routineCol().ref.orderBy('date', 'desc').limit(1).get();
      const items: RoutineItem[] = last.empty
        ? DEFAULT_ROUTINE
        : (last.docs[0].data() as any).items;
      this.routine = withKeys(items).map((i) => ({ ...i, done: false }));
    } catch (err) {
      console.error('Failed to load routine', err);
      this.routine = DEFAULT_ROUTINE.map((i) => ({ ...i }));
    }
  }

  private async saveRoutine() {
    if (!this.uid) return;
    const date = this.moodService.dateKey();
    try {
      await this.routineCol().doc(date).set({ date, items: this.routine });
    } catch (err) {
      console.error('Failed to save routine', err);
      this.showToast(this.t('routine.saveFailed'));
    }
  }

  toggleItem(item: RoutineItem) {
    item.done = !item.done;
    this.saveRoutine();
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.routine = ev.detail.complete(this.routine);
    this.saveRoutine();
  }

  addItem() {
    const name = this.newRoutineItem.trim();
    if (!name) return;
    this.routine = [
      ...this.routine,
      { name, image: 'assets/imgs/image40.png', done: false },
    ];
    this.newRoutineItem = '';
    this.saveRoutine();
  }

  itemName(item: RoutineItem): string {
    return item.key ? this.t(`routine.items.${item.key}`) : item.name;
  }

  removeItem(item: RoutineItem) {
    this.routine = this.routine.filter((i) => i !== item);
    this.saveRoutine();
  }

  private t(key: string, params?: Record<string, any>): string {
    return this.language.translate(key, params);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color: 'dark',
      position: 'top',
    });
    await toast.present();
  }
}
