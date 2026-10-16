import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  ItemReorderEventDetail,
  ToastController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  MOODS,
  Mood,
  MoodEntry,
  MoodService,
} from '../services/mood/mood.service';

type Segment = 'diary' | 'learn' | 'calm';

interface Condition {
  id: string;
  name: string;
  image: string;
  color: string;
  summary: string;
  signs: string[];
  helps: string[];
}

interface DayCell {
  key: string;
  weekday: string;
  day: number;
  isToday: boolean;
  entry?: MoodEntry;
}

interface RoutineItem {
  name: string;
  image: string;
  done: boolean;
}

const DEFAULT_ROUTINE: RoutineItem[] = [
  { name: 'Meditation', image: 'assets/imgs/image7.png', done: false },
  { name: 'Breathing', image: 'assets/imgs/image8.png', done: false },
  { name: 'Cycling', image: 'assets/imgs/image24.png', done: false },
  { name: 'Reading', image: 'assets/imgs/image4.png', done: false },
  { name: 'Listening to music', image: 'assets/imgs/image5.png', done: false },
];

// Box breathing: 4 seconds per phase
const BREATH_PHASES = [
  { label: 'Breathe in', scale: 1 },
  { label: 'Hold', scale: 1 },
  { label: 'Breathe out', scale: 0.6 },
  { label: 'Hold', scale: 0.6 },
];
const PHASE_SECONDS = 4;

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnDestroy {
  segment: Segment = 'learn';

  // Mood diary
  moods = MOODS;
  loggedIn = true;
  loadingDiary = true;
  history: MoodEntry[] = [];
  today: MoodEntry | null = null;
  changingToday = false;
  week: DayCell[] = [];
  streak = 0;
  monthCount = 0;

  // Learn
  conditions: Condition[] = [
    {
      id: 'anxiety',
      name: 'Anxiety',
      image: 'assets/imgs/image30.png',
      color: '#ffe8de',
      summary:
        'Feeling worried or afraid now and then is a normal part of life. Anxiety becomes a problem when the worry is frequent, hard to control, and gets in the way of everyday life.',
      signs: [
        'Feeling restless, tense or on edge',
        'Racing or worrying thoughts that are hard to stop',
        'Trouble sleeping or concentrating',
        'A fast heartbeat, sweating or shallow breathing',
        'Avoiding places or situations that feel stressful',
      ],
      helps: [
        'Slow breathing exercises (try the Calm tab)',
        'Regular movement and enough sleep',
        'Cutting back on caffeine and alcohol',
        'Talking therapy such as CBT',
      ],
    },
    {
      id: 'depression',
      name: 'Depression',
      image: 'assets/imgs/image22.png',
      color: '#e3ebff',
      summary:
        'Depression is more than feeling sad for a day or two. It is a low mood or loss of interest that lasts for two weeks or more and affects how you think, feel and manage daily activities.',
      signs: [
        'Feeling sad, empty or hopeless most of the time',
        'Losing interest in things you used to enjoy',
        'Changes in sleep or appetite',
        'Tiredness and low energy',
        'Feeling worthless or guilty',
      ],
      helps: [
        'Small daily routines and achievable goals',
        'Staying connected with people you trust',
        'Gentle exercise and time outdoors',
        'Talking therapy, and medication if a doctor recommends it',
      ],
    },
    {
      id: 'low-mood',
      name: 'Low mood',
      image: 'assets/imgs/image8.png',
      color: '#fff4cc',
      summary:
        'Everyone has days when they feel down. Low mood often has a cause, such as stress or a difficult event, and usually lifts within a few days or weeks.',
      signs: [
        'Sadness or tearfulness',
        'Feeling tired or unmotivated',
        'Feeling irritable or frustrated',
        'Lower confidence than usual',
      ],
      helps: [
        'A regular sleep routine',
        'Getting outside and moving your body',
        'Doing something you enjoy, even briefly',
        'Talking to someone. If it lasts more than two weeks, see a professional',
      ],
    },
    {
      id: 'self-esteem',
      name: 'Self-esteem',
      image: 'assets/imgs/image37.png',
      color: '#dff7e3',
      summary:
        'Self-esteem is how you value and think about yourself. Low self-esteem can make it harder to try new things, set boundaries and recover from setbacks.',
      signs: [
        'Harsh self-criticism',
        'Constantly comparing yourself to others',
        'Finding it hard to accept compliments',
        'Avoiding challenges for fear of failing',
      ],
      helps: [
        'Writing down your strengths and small wins',
        'Noticing and challenging negative self-talk',
        'Setting small goals you can reach',
        'Treating yourself as you would a good friend',
      ],
    },
    {
      id: 'ocd',
      name: 'OCD',
      image: 'assets/imgs/image28.png',
      color: '#ece3ff',
      summary:
        'Obsessive-compulsive disorder (OCD) involves unwanted, intrusive thoughts (obsessions) and repetitive actions or rituals (compulsions) that a person feels driven to do to ease the distress.',
      signs: [
        'Repeated, upsetting thoughts that are hard to dismiss',
        'Excessive checking, cleaning, counting or ordering',
        'Feeling anxious until a ritual is done "right"',
        'Rituals taking up a lot of time each day',
      ],
      helps: [
        'CBT with exposure and response prevention (ERP)',
        'Medication prescribed by a doctor',
        'Support groups and understanding from loved ones',
      ],
    },
    {
      id: 'schizophrenia',
      name: 'Schizophrenia',
      image: 'assets/imgs/image23.png',
      color: '#ffe3ec',
      summary:
        'Schizophrenia is a serious, long-term condition that affects how a person thinks, feels and experiences reality. With early treatment and support, many people manage their symptoms and live full lives.',
      signs: [
        'Hearing or seeing things others do not (hallucinations)',
        'Strongly held beliefs that are not based in reality (delusions)',
        'Confused or disorganised thinking and speech',
        'Withdrawing from others and losing motivation',
      ],
      helps: [
        'Early assessment and treatment by mental health professionals',
        'Medication and talking therapy',
        'Support from family, friends and community services',
      ],
    },
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
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.uid = await this.moodService.userId();
    this.loggedIn = !!this.uid;
    await Promise.all([this.loadDiary(), this.loadRoutine()]);
  }

  ionViewWillLeave() {
    this.stopBreathing();
  }

  ngOnDestroy() {
    this.stopBreathing();
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
        weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
        day: d.getDate(),
        isToday: i === 0,
        entry: byDate.get(key),
      });
    }
    this.week = days;
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

  moodFor(entry: MoodEntry | null | undefined): Mood | null {
    return this.moodService.findMood(entry?.mood);
  }

  formatDate(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (key === this.moodService.dateKey()) return 'Today';
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  async logToday(mood: Mood) {
    if (!this.loggedIn) {
      this.showToast('Create a free account to keep a mood diary.');
      return;
    }
    try {
      await this.moodService.setToday(mood);
      this.changingToday = false;
      await this.loadDiary();
    } catch (err) {
      console.error('Failed to save mood', err);
      this.showToast('Could not save your mood. Please try again.');
    }
  }

  async editNote(entry: MoodEntry) {
    const alert = await this.alertCtrl.create({
      header: this.formatDate(entry.date),
      subHeader: `${entry.emoji} ${entry.mood}`,
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'What happened today? How did it make you feel?',
          value: entry.note || '',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            try {
              await this.moodService.saveNote(entry.date, (data.note || '').trim());
              await this.loadDiary();
            } catch (err) {
              console.error('Failed to save note', err);
              this.showToast('Could not save your note. Please try again.');
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
        this.routine = (today.data() as any).items;
        return;
      }
      const last = await this.routineCol().ref.orderBy('date', 'desc').limit(1).get();
      const items: RoutineItem[] = last.empty
        ? DEFAULT_ROUTINE
        : (last.docs[0].data() as any).items;
      this.routine = items.map((i) => ({ ...i, done: false }));
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
      this.showToast('Could not save your routine. Please try again.');
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

  removeItem(item: RoutineItem) {
    this.routine = this.routine.filter((i) => i !== item);
    this.saveRoutine();
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
