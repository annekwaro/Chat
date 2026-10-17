import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, IonicSlides, ToastController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { AuthService } from '../services/auth/auth.service';
import {
  Content,
  ContentService,
  FORMATS,
  FORMAT_ICONS,
  Format,
} from '../services/content/content.service';
import { MOODS, Mood, MoodService } from '../services/mood/mood.service';
import { MoodFaceComponent } from '../components/mood-face/mood-face.component';
import { CheckInService } from '../components/check-in/check-in.service';
import { Subscription } from 'rxjs';

register();

interface HeroSlide {
  tag: string;
  icon: string;
  title: string;
  highlight: string; // second line, in the accent colour
  text: string;
  cta: string;
  image: string;
  background: string;
  accent: string;
  route?: any[];
  queryParams?: Record<string, string>;
  checkIn?: boolean; // opens the daily check-in instead of navigating
}

interface Featured {
  title: string;
  image: string;
  color: string;
  buttonColor: string;
  cta: string;
  route: string[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, RouterModule, MoodFaceComponent],
})
export class Tab1Page implements OnInit, OnDestroy {
  @ViewChild('heroCarousel') heroCarousel?: ElementRef;

  swiperModules = [IonicSlides];

  greeting = '';
  userName = '';
  userPhoto = '';
  initials = '';
  showGuestNote = false;

  moods = MOODS;
  selectedMood: Mood | null = null;
  private uid: string | null = null;
  private moodSub?: Subscription;

  heroSlides: HeroSlide[] = [
    {
      tag: 'Your daily space',
      icon: 'sparkles',
      title: 'Better mind,',
      highlight: 'brighter you',
      text: 'Check in, learn and talk things through. Your mental health matters.',
      cta: 'Start a chat',
      image: 'assets/imgs/image33.png',
      background: 'linear-gradient(135deg, #e6efff 0%, #cfe0ff 100%)',
      accent: '#0558e7',
      route: ['/', 'tabs', 'home'],
    },
    {
      tag: 'Daily check-in',
      icon: 'happy',
      title: 'How are you,',
      highlight: 'really?',
      text: 'Log your mood in a few seconds and spot patterns over time.',
      cta: 'Check in',
      image: 'assets/imgs/image27.png',
      background: 'linear-gradient(135deg, #e7f8ec 0%, #c8eed4 100%)',
      accent: '#1f9d55',
      checkIn: true,
    },
    {
      tag: 'Learn',
      icon: 'book',
      title: 'Find your way,',
      highlight: 'one step at a time',
      text: 'Understand anxiety, low mood and more, and what can help.',
      cta: 'Learn',
      image: 'assets/imgs/image31.png',
      background: 'linear-gradient(135deg, #fff7dc 0%, #ffe7a6 100%)',
      accent: '#b45309',
      route: ['/', 'tabs', 'tab4'],
      queryParams: { segment: 'learn' },
    },
    {
      tag: 'Calm',
      icon: 'leaf',
      title: 'Make space',
      highlight: 'for calm',
      text: 'A few slow breaths and small routines can change your day.',
      cta: 'Breathe',
      image: 'assets/imgs/image34.png',
      background: 'linear-gradient(135deg, #f2edff 0%, #dcd2ff 100%)',
      accent: '#6d4ae6',
      route: ['/', 'tabs', 'tab4'],
      queryParams: { segment: 'calm' },
    },
  ];

  shortcuts = [
    { label: 'Chat', icon: 'chatbubbles', color: '#1f9d55', tint: '#e3f8e9', route: ['/', 'tabs', 'home'] },
    { label: 'Breathe', icon: 'leaf', color: '#7c5cf0', tint: '#f0ebff', route: ['/', 'tabs', 'tab4'], query: { segment: 'calm' } },
    { label: 'Diary', icon: 'book', color: '#e0567a', tint: '#ffe3ec', route: ['/', 'tabs', 'tab4'], query: { segment: 'diary' } },
    { label: 'Get help', icon: 'heart', color: '#d97706', tint: '#fff4cc', route: ['/', 'help'] },
  ];

  featured: Featured[] = [
    {
      title: 'Consult a therapist',
      image: 'assets/imgs/image4.png',
      color: 'primary',
      buttonColor: 'warning',
      cta: 'Start chat',
      route: ['/', 'tabs', 'home'],
    },
    {
      title: 'Declutter the mind',
      image: 'assets/imgs/image5.png',
      color: 'warning',
      buttonColor: 'primary',
      cta: 'Discover',
      route: ['/', 'tabs', 'tab4'],
    },
    {
      title: 'Self-love for you',
      image: 'assets/imgs/image6.png',
      color: 'success',
      buttonColor: 'warning',
      cta: 'Explore',
      route: ['/', 'tabs', 'tab2'],
    },
    {
      title: 'Meditation tips',
      image: 'assets/imgs/image7.png',
      color: 'tertiary',
      buttonColor: 'warning',
      cta: 'Explore',
      route: ['/', 'tabs', 'tab2'],
    },
    {
      title: 'Manage emotions',
      image: 'assets/imgs/image8.png',
      color: 'warning',
      buttonColor: 'primary',
      cta: 'Explore',
      route: ['/', 'tabs', 'tab2'],
    },
  ];

  categories = FORMATS;
  selectedCategory: Format | 'all' = 'all';
  searchTerm = '';

  // "Insights for you" come from the shared content library (also used by Explore)
  insights: Content[] = [];
  filteredInsights: Content[] = [];

  constructor(
    private auth: AuthService,
    private toastCtrl: ToastController,
    private contentService: ContentService,
    private moodService: MoodService,
    private checkIn: CheckInService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check-ins from the "+" button or the Mood diary
    this.moodSub = this.moodService.changed.subscribe(() => this.loadTodayMood());
    this.greeting = this.getGreeting();
    this.loadUser();
    this.contentService.getLibrary().then((library) => {
      this.insights = library.filter((c) => c.forYou);
      this.applyFilters();
    });
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  private async loadUser() {
    const uid = await this.auth.getCurrentUserId();
    this.uid = uid;
    this.showGuestNote = this.auth.isGuest() && !this.guestNoteDismissed();
    if (!uid) return;
    this.loadTodayMood();
    try {
      const user = await this.auth.getProfile();
      if (user?.name) {
        this.userName = user.name.split(' ')[0];
        this.initials = user.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0].toUpperCase())
          .join('');
      }
      // pravatar.cc was a random stock photo given to older accounts, not the person
      const photo = user?.photo || '';
      this.userPhoto = photo.includes('pravatar.cc') ? '' : photo;
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  }

  // Start the hero carousel once the page is showing and its slides are rendered,
  // so loop mode can measure them (starting it while hidden breaks the loop)
  private heroStarted = false;

  ionViewDidEnter() {
    if (this.heroStarted || !this.heroCarousel?.nativeElement.initialize) return;
    this.heroCarousel.nativeElement.initialize();
    this.heroStarted = true;
  }

  ngOnDestroy() {
    this.moodSub?.unsubscribe();
  }

  openCheckIn() {
    this.checkIn.open();
  }

  heroAction(slide: HeroSlide) {
    if (slide.checkIn) this.openCheckIn();
    else if (slide.route) this.router.navigate(slide.route, { queryParams: slide.queryParams });
  }

  // Re-read today's mood when coming back to Home (it can be changed in the Mood diary)
  ionViewWillEnter() {
    if (this.uid) this.loadTodayMood();
  }

  private async loadTodayMood() {
    try {
      const entry = await this.moodService.getToday();
      this.selectedMood = this.moodService.findMood(entry?.mood);
    } catch (err) {
      console.error('Failed to load mood', err);
    }
  }

  async selectMood(mood: Mood) {
    const previous = this.selectedMood;
    this.selectedMood = previous === mood ? null : mood;

    if (!this.uid) {
      this.showToast('Create a free account to save your mood check-ins.');
      return;
    }

    try {
      if (this.selectedMood) {
        await this.moodService.setToday(this.selectedMood);
      } else {
        await this.moodService.clearToday();
      }
    } catch (err) {
      console.error('Failed to save mood', err);
      this.selectedMood = previous;
      this.showToast('Could not save your mood. Please try again.');
    }
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

  onSearch(event: any) {
    this.searchTerm = (event.detail.value || '').toLowerCase().trim();
    this.applyFilters();
  }

  selectCategory(value: Format | 'all') {
    this.selectedCategory = value;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredInsights = this.insights.filter((item) => {
      const matchesCategory =
        this.selectedCategory === 'all' || item.format === this.selectedCategory;
      const matchesSearch =
        !this.searchTerm ||
        item.title.toLowerCase().includes(this.searchTerm) ||
        this.topicName(item.topic).toLowerCase().includes(this.searchTerm);
      return matchesCategory && matchesSearch;
    });
  }

  iconFor(format: Format): string {
    return FORMAT_ICONS[format];
  }

  topicName(id: string): string {
    return this.contentService.topicName(id);
  }

  // Gentle, dismissible suggestion for guests; never blocks anything
  private guestNoteDismissed(): boolean {
    try {
      return localStorage.getItem('guestNoteDismissed') === '1';
    } catch {
      return false;
    }
  }

  dismissGuestNote() {
    this.showGuestNote = false;
    try {
      localStorage.setItem('guestNoteDismissed', '1');
    } catch {
      // storage unavailable (e.g. private mode): just hide it for now
    }
  }

  // The bell reminds signed-in users who haven't checked in today
  get needsCheckIn(): boolean {
    return !!this.uid && !this.selectedMood;
  }

  async showNotifications() {
    if (this.needsCheckIn) {
      document.getElementById('mood-check-in')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.showToast("You haven't checked in today. How are you feeling?");
      return;
    }
    await this.showToast("You're all caught up!");
  }

  handleRefresh(event: any) {
    this.greeting = this.getGreeting();
    return this.loadUser().finally(() => event.target.complete());
  }

  trackById(_: number, item: Content) {
    return item.id;
  }
}
