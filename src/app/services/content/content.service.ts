import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

export type Format = 'video' | 'podcast' | 'audio';

export interface Topic {
  id: string;
  name: string;
  image: string;
  color: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  topic: string;
  format: Format;
  duration: string;
  image: string;
  mediaUrl?: string; // video/audio file to play in the detail sheet
  featured?: boolean; // shown in the Explore carousel
  forYou?: boolean; // shown in "Insights for you" on Home
  order?: number; // sort order when loaded from Firestore
}

export const FORMATS: { value: Format | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'video', label: 'Videos' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'audio', label: 'Audio' },
];

export const FORMAT_ICONS: Record<Format, string> = {
  video: 'play',
  podcast: 'mic',
  audio: 'headset',
};

const TOPICS: Topic[] = [
  { id: 'self-love', name: 'Self-love', image: 'assets/imgs/image33.png', color: '#ffe3ec' },
  { id: 'meditation', name: 'Meditation', image: 'assets/imgs/image4.png', color: '#fff4cc' },
  { id: 'meaning', name: 'Meaningful life', image: 'assets/imgs/image29.png', color: '#dff7e3' },
  { id: 'sleep', name: 'Sleep', image: 'assets/imgs/image35.png', color: '#e3ebff' },
  { id: 'anxiety', name: 'Anxiety', image: 'assets/imgs/image8.png', color: '#ffe8de' },
  { id: 'relationships', name: 'Relationships', image: 'assets/imgs/image24.png', color: '#ece3ff' },
];

// Used when the Firestore `content` collection is empty or can't be read
const FALLBACK_LIBRARY: Content[] = [
  {
    id: '1',
    title: 'Living with purpose',
    description:
      'A meaningful life involves aligning your actions with your values and passions, experiencing joy and fulfillment along the way.',
    topic: 'meaning',
    format: 'video',
    duration: '9 min',
    image: 'assets/imgs/image7.png',
    featured: true,
  },
  {
    id: '2',
    title: 'Breathe anywhere',
    description:
      'A simple yet powerful breathing practice you can use anywhere and anytime to calm your body and mind.',
    topic: 'meditation',
    format: 'audio',
    duration: '5 min',
    image: 'assets/imgs/image9.png',
    featured: true,
  },
  {
    id: '3',
    title: 'Know yourself',
    description:
      'Through regular meditation you can develop self-awareness and notice your thoughts without judging them.',
    topic: 'meditation',
    format: 'video',
    duration: '12 min',
    image: 'assets/imgs/image8.png',
    featured: true,
  },
  {
    id: '4',
    title: 'Be kind to yourself',
    description:
      'Accepting yourself with all your strengths and flaws, and nurturing a positive relationship with yourself.',
    topic: 'self-love',
    format: 'podcast',
    duration: '22 min',
    image: 'assets/imgs/image33.png',
    forYou: true,
  },
  {
    id: '5',
    title: 'The emotional wheel',
    description:
      'Learn to name what you are feeling. Putting words to emotions makes them easier to understand and manage.',
    topic: 'self-love',
    format: 'video',
    duration: '6 min',
    image: 'assets/imgs/image4.png',
    forYou: true,
  },
  {
    id: '6',
    title: 'Wind down for sleep',
    description:
      'A gentle guided session to slow your thoughts and help you drift into deeper, more restful sleep.',
    topic: 'sleep',
    format: 'audio',
    duration: '15 min',
    image: 'assets/imgs/image35.png',
    forYou: true,
  },
  {
    id: '7',
    title: 'When worry takes over',
    description:
      'Practical ways to notice anxious thoughts, ground yourself in the present, and respond instead of react.',
    topic: 'anxiety',
    format: 'podcast',
    duration: '18 min',
    image: 'assets/imgs/image30.png',
    forYou: true,
  },
  {
    id: '8',
    title: 'Riding out a rainy day',
    description:
      'Some days are heavy. Small, achievable steps to look after yourself when your mood is low.',
    topic: 'anxiety',
    format: 'audio',
    duration: '8 min',
    image: 'assets/imgs/image25.png',
    forYou: true,
  },
  {
    id: '9',
    title: 'Better conversations',
    description:
      'How to listen, share how you feel, and set healthy boundaries with the people who matter to you.',
    topic: 'relationships',
    format: 'podcast',
    duration: '24 min',
    image: 'assets/imgs/image21.png',
    forYou: true,
  },
  {
    id: '10',
    title: 'Small steps, big change',
    description:
      'Meaning is built one small step at a time. Set goals that fit your life and celebrate progress.',
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

  constructor(private afs: AngularFirestore) {}

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
    return this.topics.find((t) => t.id === id)?.name || '';
  }
}
