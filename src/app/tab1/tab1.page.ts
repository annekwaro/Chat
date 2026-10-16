import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

register();

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
  imports: [IonicModule, CommonModule, RouterModule],
})
export class Tab1Page implements OnInit {
  swiperModules = [IonicSlides];

  greeting = '';
  userName = '';
  userPhoto = '';
  initials = '';
  showGuestNote = false;

  moods = MOODS;
  selectedMood: Mood | null = null;
  private uid: string | null = null;

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
    private moodService: MoodService
  ) {}

  ngOnInit() {
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
