import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { IonContent, IonicModule, IonicSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { register } from 'swiper/element/bundle';
import {
  Content,
  ContentService,
  FORMATS,
  FORMAT_ICONS,
  Format,
  Topic,
} from '../services/content/content.service';
import { TranslocoDirective } from '@jsverse/transloco';
import { PluralPipe } from '../i18n/i18n';

register();

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, RouterModule, TranslocoDirective, PluralPipe],
})
export class Tab2Page implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  swiperModules = [IonicSlides];

  topics: Topic[];
  formats = FORMATS;

  library: Content[] = [];
  featured: Content[] = [];
  filtered: Content[] = [];

  selectedTopic: string | null = null;
  selectedFormat: Format | 'all' = 'all';
  searchTerm = '';

  selected: Content | null = null;

  private ready!: Promise<void>;
  private paramsSub?: Subscription;

  // Shortcuts into Discover (text: explore.tool.<id>)
  tools = [
    { id: 'breathing', icon: 'leaf', color: '#7c5cf0', tint: '#f0ebff', segment: 'calm' },
    { id: 'mood', icon: 'happy', color: '#1f9d55', tint: '#e3f8e9', segment: 'diary' },
    { id: 'routine', icon: 'checkmark-done', color: '#0558e7', tint: '#e3ebff', segment: 'calm' },
    { id: 'learn', icon: 'book', color: '#d97706', tint: '#fff4cc', segment: 'learn' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {
    this.topics = contentService.topics;
  }

  ngOnInit() {
    this.ready = this.contentService.getLibrary().then((library) => {
      this.library = library;
      this.featured = library.filter((c) => c.featured);
      this.applyFilters();
    });
    // Home links here with ?item=<id> or ?format=<format>
    this.paramsSub = this.route.queryParamMap.subscribe((params) =>
      this.handleLink(params)
    );
  }

  ngOnDestroy() {
    this.paramsSub?.unsubscribe();
  }

  private async handleLink(params: ParamMap) {
    const itemId = params.get('item');
    const format = params.get('format') as Format | null;
    if (!itemId && !format) return;

    await this.ready;
    if (format && FORMAT_ICONS[format]) {
      this.selectedTopic = null;
      this.selectedFormat = format;
      this.applyFilters();
      setTimeout(() => this.scrollToLibrary(), 300);
    }
    const item = this.library.find((c) => c.id === itemId);
    if (item) this.open(item);

    // Clear the params so the same link works again next time
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  onSearch(event: any) {
    this.searchTerm = (event.detail.value || '').toLowerCase().trim();
    this.applyFilters();
  }

  selectTopic(topic: Topic) {
    this.selectedTopic = this.selectedTopic === topic.id ? null : topic.id;
    this.applyFilters();
    if (this.selectedTopic) this.scrollToLibrary();
  }

  clearTopic() {
    this.selectedTopic = null;
    this.applyFilters();
  }

  selectFormat(value: Format | 'all') {
    this.selectedFormat = value;
    this.applyFilters();
  }

  private applyFilters() {
    this.filtered = this.library.filter((c) => {
      const matchesTopic = !this.selectedTopic || c.topic === this.selectedTopic;
      const matchesFormat =
        this.selectedFormat === 'all' || c.format === this.selectedFormat;
      const matchesSearch =
        !this.searchTerm ||
        this.title(c).toLowerCase().includes(this.searchTerm) ||
        this.description(c).toLowerCase().includes(this.searchTerm) ||
        this.topicName(c.topic).toLowerCase().includes(this.searchTerm);
      return matchesTopic && matchesFormat && matchesSearch;
    });
  }

  private scrollToLibrary() {
    const el = document.getElementById('library');
    if (el) this.content.scrollToPoint(0, el.offsetTop - 8, 400);
  }

  topicName(id: string | null): string {
    return this.contentService.topicName(id);
  }

  topicCount(id: string): number {
    return this.library.filter((c) => c.topic === id).length;
  }

  iconFor(format: Format): string {
    return FORMAT_ICONS[format];
  }

  formatName(format: Format): string {
    return this.contentService.formatName(format);
  }

  title(item: Content): string {
    return this.contentService.title(item);
  }

  description(item: Content): string {
    return this.contentService.description(item);
  }

  open(item: Content) {
    this.selected = item;
  }

  close() {
    this.selected = null;
  }

  talkToTherapist() {
    this.close();
    this.router.navigate(['/', 'tabs', 'home']);
  }

  trackById(_: number, item: Content) {
    return item.id;
  }
}
