import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  companyLabel,
  moodLabel,
} from '../services/mood/mood.service';
import { CheckInService } from '../components/check-in/check-in.service';
import { LOCALE } from 'src/app/locale';

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
  mood?: Mood | null;
  height?: number; // bar height in the weekly chart, as a percentage
}

// Calendar weeks start on Monday
const CALENDAR_WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface RoutineItem {
  name: string;
  image: string;
  done: boolean;
}

const DEFAULT_ROUTINE: RoutineItem[] = [
  { name: 'Méditation', image: 'assets/imgs/image7.png', done: false },
  { name: 'Respiration', image: 'assets/imgs/image8.png', done: false },
  { name: 'Vélo', image: 'assets/imgs/image24.png', done: false },
  { name: 'Lecture', image: 'assets/imgs/image4.png', done: false },
  { name: 'Écouter de la musique', image: 'assets/imgs/image5.png', done: false },
];

// Routines saved before the app was in French still have the English default names
const OLD_ROUTINE_NAMES: Record<string, string> = {
  Meditation: 'Méditation',
  Breathing: 'Respiration',
  Cycling: 'Vélo',
  Reading: 'Lecture',
  'Listening to music': 'Écouter de la musique',
};

function translateItems(items: RoutineItem[]): RoutineItem[] {
  return items.map((i) => ({ ...i, name: OLD_ROUTINE_NAMES[i.name] || i.name }));
}

// Box breathing: 4 seconds per phase
const BREATH_PHASES = [
  { label: 'Inspirez', scale: 1 },
  { label: 'Retenez', scale: 1 },
  { label: 'Expirez', scale: 0.6 },
  { label: 'Retenez', scale: 0.6 },
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
  readonly calendarWeekdays = CALENDAR_WEEKDAYS;
  calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  calendar: (DayCell | null)[] = [];
  private moodSub?: Subscription;

  // Learn
  conditions: Condition[] = [
    {
      id: 'anxiety',
      name: 'Anxiété',
      image: 'assets/imgs/image30.png',
      color: '#ffe8de',
      summary:
        'Se sentir inquiet ou avoir peur de temps en temps fait partie de la vie. L’anxiété devient un problème quand l’inquiétude est fréquente, difficile à contrôler et gêne la vie de tous les jours.',
      signs: [
        'Se sentir agité, tendu ou à cran',
        'Des pensées qui s’emballent et qu’on n’arrive pas à arrêter',
        'Des difficultés à dormir ou à se concentrer',
        'Le cœur qui bat vite, la transpiration ou une respiration courte',
        'Éviter les lieux ou les situations qui semblent stressants',
      ],
      helps: [
        'Des exercices de respiration lente (essayez l’onglet Calme)',
        'Bouger régulièrement et dormir suffisamment',
        'Réduire la caféine et l’alcool',
        'Une psychothérapie, par exemple une TCC',
      ],
    },
    {
      id: 'depression',
      name: 'Dépression',
      image: 'assets/imgs/image22.png',
      color: '#e3ebff',
      summary:
        'La dépression, ce n’est pas seulement être triste un jour ou deux. C’est une humeur basse ou une perte d’intérêt qui dure au moins deux semaines et qui change la façon de penser, de ressentir et de gérer le quotidien.',
      signs: [
        'Se sentir triste, vide ou sans espoir la plupart du temps',
        'Perdre l’intérêt pour ce qu’on aimait faire',
        'Des changements de sommeil ou d’appétit',
        'De la fatigue et un manque d’énergie',
        'Se sentir inutile ou coupable',
      ],
      helps: [
        'De petites routines quotidiennes et des objectifs atteignables',
        'Garder le lien avec des personnes de confiance',
        'Une activité physique douce et du temps dehors',
        'Une psychothérapie, et un traitement si un médecin le recommande',
      ],
    },
    {
      id: 'low-mood',
      name: 'Coup de blues',
      image: 'assets/imgs/image8.png',
      color: '#fff4cc',
      summary:
        'Tout le monde a des jours sans. Un coup de blues a souvent une cause, comme le stress ou un événement difficile, et passe en général en quelques jours ou quelques semaines.',
      signs: [
        'De la tristesse ou des larmes',
        'Se sentir fatigué ou démotivé',
        'Se sentir irritable ou frustré',
        'Moins de confiance en soi que d’habitude',
      ],
      helps: [
        'Des horaires de sommeil réguliers',
        'Sortir et bouger',
        'Faire quelque chose qu’on aime, même brièvement',
        'En parler à quelqu’un. Si cela dure plus de deux semaines, consultez un professionnel',
      ],
    },
    {
      id: 'self-esteem',
      name: 'Estime de soi',
      image: 'assets/imgs/image37.png',
      color: '#dff7e3',
      summary:
        'L’estime de soi, c’est la valeur qu’on s’accorde et le regard qu’on porte sur soi. Une faible estime de soi peut rendre plus difficile d’essayer de nouvelles choses, de poser des limites et de rebondir après un échec.',
      signs: [
        'Être très dur avec soi-même',
        'Se comparer sans cesse aux autres',
        'Avoir du mal à accepter les compliments',
        'Éviter les défis par peur d’échouer',
      ],
      helps: [
        'Noter ses qualités et ses petites réussites',
        'Repérer et remettre en question ses pensées négatives',
        'Se fixer de petits objectifs atteignables',
        'Se traiter comme on traiterait un bon ami',
      ],
    },
    {
      id: 'ocd',
      name: 'TOC',
      image: 'assets/imgs/image28.png',
      color: '#ece3ff',
      summary:
        'Le trouble obsessionnel compulsif (TOC) se traduit par des pensées intrusives et indésirables (obsessions) et des gestes ou rituels répétitifs (compulsions) que la personne se sent obligée de faire pour calmer son angoisse.',
      signs: [
        'Des pensées répétées et pénibles, difficiles à chasser',
        'Vérifier, nettoyer, compter ou ranger de façon excessive',
        'Rester anxieux tant qu’un rituel n’est pas fait « comme il faut »',
        'Des rituels qui prennent beaucoup de temps chaque jour',
      ],
      helps: [
        'Une TCC avec exposition et prévention de la réponse (EPR)',
        'Un traitement prescrit par un médecin',
        'Des groupes de soutien et la compréhension des proches',
      ],
    },
    {
      id: 'schizophrenia',
      name: 'Schizophrénie',
      image: 'assets/imgs/image23.png',
      color: '#ffe3ec',
      summary:
        'La schizophrénie est un trouble sérieux et durable qui modifie la façon de penser, de ressentir et de percevoir la réalité. Avec un traitement précoce et du soutien, beaucoup de personnes gèrent leurs symptômes et vivent pleinement.',
      signs: [
        'Entendre ou voir des choses que les autres ne perçoivent pas (hallucinations)',
        'Des convictions fortes qui ne reposent pas sur la réalité (idées délirantes)',
        'Une pensée et un discours confus ou désorganisés',
        'Se replier sur soi et perdre sa motivation',
      ],
      helps: [
        'Une évaluation et un traitement précoces par des professionnels de santé mentale',
        'Un traitement médicamenteux et une psychothérapie',
        'Le soutien de la famille, des amis et des services de proximité',
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
    private router: Router,
    private route: ActivatedRoute,
    private checkIn: CheckInService
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
        weekday: d.toLocaleDateString(LOCALE, { weekday: 'short' }),
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
      cells.push({ key, weekday: '', day, isToday: key === todayKey, entry, mood: this.moodFor(entry) });
    }
    this.calendar = cells;
  }

  get calendarTitle(): string {
    return this.calendarMonth.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
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
    return moodLabel(key);
  }

  companyNames(keys: string[] | undefined): string {
    return (keys || []).map(companyLabel).join(', ');
  }

  companyName(key: string): string {
    return companyLabel(key);
  }

  moodFor(entry: MoodEntry | null | undefined): Mood | null {
    return this.moodService.findMood(entry?.mood);
  }

  formatDate(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (key === this.moodService.dateKey()) return 'Aujourd’hui';
    return date.toLocaleDateString(LOCALE, {
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
      subHeader: moodLabel(entry.mood),
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'Que s’est-il passé\u00a0? Qu’avez-vous ressenti\u00a0?',
          value: entry.note || '',
        },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            try {
              await this.moodService.saveNote(entry.date, (data.note || '').trim());
            } catch (err) {
              console.error('Failed to save note', err);
              this.showToast('Impossible d’enregistrer votre note. Réessayez.');
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
        this.routine = translateItems((today.data() as any).items);
        return;
      }
      const last = await this.routineCol().ref.orderBy('date', 'desc').limit(1).get();
      const items: RoutineItem[] = last.empty
        ? DEFAULT_ROUTINE
        : (last.docs[0].data() as any).items;
      this.routine = translateItems(items).map((i) => ({ ...i, done: false }));
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
      this.showToast('Impossible d’enregistrer votre routine. Réessayez.');
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
