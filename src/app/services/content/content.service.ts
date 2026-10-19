import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LanguageService } from '../../i18n/language.service';

export type Format = 'video' | 'podcast' | 'audio';

export interface Topic {
  id: string; // name: topics.<id> in the translations
  image: string;
  color: string;
}

// Built-in sessions take their title and description from the translations (library.<id>).
// Sessions added in Firestore have `title` and `description`, plus optional English
// versions in `title_en` and `description_en`.
export interface Content {
  id: string;
  title?: string;
  description?: string;
  title_en?: string;
  description_en?: string;
  builtIn?: boolean;
  topic: string;
  format: Format;
  duration: string;
  image: string;
  mediaUrl?: string; // video/audio file to play in the detail sheet
  featured?: boolean; // shown in the Explore carousel
  forYou?: boolean; // shown in "Insights for you" on Home
  order?: number; // sort order when loaded from Firestore
}

// Filter chips; labels are formats.<value>
export const FORMATS: (Format | 'all')[] = ['all', 'video', 'podcast', 'audio'];

export const FORMAT_ICONS: Record<Format, string> = {
  video: 'play',
  podcast: 'mic',
  audio: 'headset',
};

const TOPICS: Topic[] = [
  { id: 'self-love', image: 'assets/imgs/image33.png', color: '#ffe3ec' },
  { id: 'meditation', image: 'assets/imgs/image4.png', color: '#fff4cc' },
  { id: 'meaning', image: 'assets/imgs/image29.png', color: '#dff7e3' },
  { id: 'sleep', image: 'assets/imgs/image35.png', color: '#e3ebff' },
  { id: 'anxiety', image: 'assets/imgs/image8.png', color: '#ffe8de' },
  { id: 'relationships', image: 'assets/imgs/image24.png', color: '#ece3ff' },
];

// Used when the Firestore `content` collection is empty or can't be read
const FALLBACK_LIBRARY: Content[] = [
  {
    id: '1',
    builtIn: true,
    topic: 'meaning',
    format: 'video',
    duration: '9 min',
    image: 'assets/imgs/image7.png',
    featured: true,
  },
  {
    id: '2',
    builtIn: true,
    topic: 'meditation',
    format: 'audio',
    duration: '5 min',
    image: 'assets/imgs/image9.png',
    featured: true,
  },
  {
    id: '3',
    builtIn: true,
    topic: 'meditation',
    format: 'video',
    duration: '12 min',
    image: 'assets/imgs/image8.png',
    featured: true,
  },
  {
    id: '4',
    builtIn: true,
    topic: 'self-love',
    format: 'podcast',
    duration: '22 min',
    image: 'assets/imgs/image33.png',
    forYou: true,
  },
  {
    id: '5',
    builtIn: true,
    topic: 'self-love',
    format: 'video',
    duration: '6 min',
    image: 'assets/imgs/image4.png',
    forYou: true,
  },
  {
    id: '6',
    builtIn: true,
    topic: 'sleep',
    format: 'audio',
    duration: '15 min',
    image: 'assets/imgs/image35.png',
    forYou: true,
  },
  {
    id: '7',
    builtIn: true,
    topic: 'anxiety',
    format: 'podcast',
    duration: '18 min',
    image: 'assets/imgs/image30.png',
    forYou: true,
  },
  {
    id: '8',
    builtIn: true,
    topic: 'anxiety',
    format: 'audio',
    duration: '8 min',
    image: 'assets/imgs/image25.png',
    forYou: true,
  },
  {
    id: '9',
    builtIn: true,
    topic: 'relationships',
    format: 'podcast',
    duration: '24 min',
    image: 'assets/imgs/image21.png',
    forYou: true,
  },
  {
    id: '10',
    builtIn: true,
    topic: 'meaning',
    format: 'video',
    duration: '10 min',
    image: 'assets/imgs/image26.png',
  },
];

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly topics = TOPICS;

  private library: Promise<Content[]> | null = null;

  constructor(private afs: AngularFirestore, private language: LanguageService) {}

  // Loads once and shares the result between Home and Explore
  getLibrary(): Promise<Content[]> {
    if (!this.library) this.library = this.load();
    return this.library;
  }

  private async load(): Promise<Content[]> {
    try {
      const snap = await this.afs.collection('content').ref.get();
      if (!snap.empty) {
        return snap.docs
          .map((doc) => ({ ...(doc.data() as Omit<Content, 'id'>), id: doc.id }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    } catch (err) {
      console.warn('Could not load content from Firestore, using built-in list', err);
    }
    return FALLBACK_LIBRARY;
  }

  topicName(id: string | null): string {
    return this.topics.some((t) => t.id === id) ? this.language.translate(`topics.${id}`) : '';
  }

  title(item: Content): string {
    return this.text(item, 'title');
  }

  description(item: Content): string {
    return this.text(item, 'description');
  }

  // "Vidéo" / "Video"
  formatName(format: Format): string {
    return this.language.translate(`format.${format}`);
  }

  private text(item: Content, field: 'title' | 'description'): string {
    if (item.builtIn) return this.language.translate(`library.${item.id}.${field}`);
    const english = this.language.lang === 'en' ? item[`${field}_en`] : '';
    return english || item[field] || '';
  }
}
