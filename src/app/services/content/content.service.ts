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
  { value: 'all', label: 'Tout' },
  { value: 'video', label: 'Vidéos' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'audio', label: 'Audio' },
];

// "Vidéo • 6 min"
export const FORMAT_NAMES: Record<Format, string> = {
  video: 'Vidéo',
  podcast: 'Podcast',
  audio: 'Audio',
};

export const FORMAT_ICONS: Record<Format, string> = {
  video: 'play',
  podcast: 'mic',
  audio: 'headset',
};

const TOPICS: Topic[] = [
  { id: 'self-love', name: 'Amour de soi', image: 'assets/imgs/image33.png', color: '#ffe3ec' },
  { id: 'meditation', name: 'Méditation', image: 'assets/imgs/image4.png', color: '#fff4cc' },
  { id: 'meaning', name: 'Donner du sens', image: 'assets/imgs/image29.png', color: '#dff7e3' },
  { id: 'sleep', name: 'Sommeil', image: 'assets/imgs/image35.png', color: '#e3ebff' },
  { id: 'anxiety', name: 'Anxiété', image: 'assets/imgs/image8.png', color: '#ffe8de' },
  { id: 'relationships', name: 'Relations', image: 'assets/imgs/image24.png', color: '#ece3ff' },
];

// Used when the Firestore `content` collection is empty or can't be read
const FALLBACK_LIBRARY: Content[] = [
  {
    id: '1',
    title: 'Vivre avec un but',
    description:
      'Une vie qui a du sens, c’est accorder ses actions à ses valeurs et à ses passions, et y trouver de la joie en chemin.',
    topic: 'meaning',
    format: 'video',
    duration: '9 min',
    image: 'assets/imgs/image7.png',
    featured: true,
  },
  {
    id: '2',
    title: 'Respirer partout',
    description:
      'Un exercice de respiration simple et efficace, à faire n’importe où et à tout moment pour apaiser le corps et l’esprit.',
    topic: 'meditation',
    format: 'audio',
    duration: '5 min',
    image: 'assets/imgs/image9.png',
    featured: true,
  },
  {
    id: '3',
    title: 'Mieux se connaître',
    description:
      'Avec une méditation régulière, on apprend à mieux se connaître et à observer ses pensées sans les juger.',
    topic: 'meditation',
    format: 'video',
    duration: '12 min',
    image: 'assets/imgs/image8.png',
    featured: true,
  },
  {
    id: '4',
    title: 'Être bienveillant envers soi',
    description:
      'S’accepter avec ses forces et ses faiblesses, et cultiver une relation positive avec soi-même.',
    topic: 'self-love',
    format: 'podcast',
    duration: '22 min',
    image: 'assets/imgs/image33.png',
    forYou: true,
  },
  {
    id: '5',
    title: 'La roue des émotions',
    description:
      'Apprenez à nommer ce que vous ressentez. Mettre des mots sur ses émotions aide à les comprendre et à les gérer.',
    topic: 'self-love',
    format: 'video',
    duration: '6 min',
    image: 'assets/imgs/image4.png',
    forYou: true,
  },
  {
    id: '6',
    title: 'Se détendre avant de dormir',
    description:
      'Une séance guidée tout en douceur pour ralentir vos pensées et trouver un sommeil plus profond et réparateur.',
    topic: 'sleep',
    format: 'audio',
    duration: '15 min',
    image: 'assets/imgs/image35.png',
    forYou: true,
  },
  {
    id: '7',
    title: 'Quand l’inquiétude prend le dessus',
    description:
      'Des pistes concrètes pour repérer les pensées anxieuses, revenir au moment présent et répondre plutôt que réagir.',
    topic: 'anxiety',
    format: 'podcast',
    duration: '18 min',
    image: 'assets/imgs/image30.png',
    forYou: true,
  },
  {
    id: '8',
    title: 'Traverser un jour de pluie',
    description:
      'Certains jours sont lourds. De petits pas réalisables pour prendre soin de vous quand le moral est bas.',
    topic: 'anxiety',
    format: 'audio',
    duration: '8 min',
    image: 'assets/imgs/image25.png',
    forYou: true,
  },
  {
    id: '9',
    title: 'Mieux communiquer',
    description:
      'Écouter, exprimer ce que vous ressentez et poser des limites saines avec les personnes qui comptent pour vous.',
    topic: 'relationships',
    format: 'podcast',
    duration: '24 min',
    image: 'assets/imgs/image21.png',
    forYou: true,
  },
  {
    id: '10',
    title: 'Petits pas, grands changements',
    description:
      'Le sens se construit pas à pas. Fixez-vous des objectifs adaptés à votre vie et célébrez vos progrès.',
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
