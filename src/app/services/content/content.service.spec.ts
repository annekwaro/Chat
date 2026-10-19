import { TestBed } from '@angular/core/testing';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { ContentService } from './content.service';
import { LanguageService } from '../../i18n/language.service';

describe('ContentService', () => {
  function setup() {
    const fakes = firebaseFakes();
    TestBed.configureTestingModule({ providers: fakes.providers });
    return { service: TestBed.inject(ContentService), firestore: fakes.firestore };
  }

  it('uses the built-in library when Firestore has no content', async () => {
    const { service } = setup();
    const library = await service.getLibrary();
    expect(library.length).toBe(10);
    expect(library.filter((c) => c.featured).length).toBe(3);
    expect(library.filter((c) => c.forYou).length).toBe(6);
  });

  it('uses Firestore content when available, sorted by order', async () => {
    const { service, firestore } = setup();
    firestore.data.set('content/b', { title: 'Second', topic: 'sleep', format: 'audio', order: 2 });
    firestore.data.set('content/a', { title: 'First', topic: 'sleep', format: 'video', order: 1 });

    const library = await service.getLibrary();

    expect(library.map((c) => [c.id, c.title])).toEqual([
      ['a', 'First'],
      ['b', 'Second'],
    ]);
  });

  it('loads only once and shares the result', async () => {
    const { service } = setup();
    expect(service.getLibrary()).toBe(service.getLibrary());
  });

  it('looks up topic names', () => {
    const { service } = setup();
    expect(service.topicName('meaning')).toBe('Donner du sens');
    expect(service.topicName('nope')).toBe('');
  });

  it('shows titles in the current language', async () => {
    const { service } = setup();
    const [first] = await service.getLibrary();
    const added = { id: 'x', title: 'Respirer', title_en: 'Breathe', topic: 'sleep', format: 'audio' as const, duration: '', image: '' };
    expect(service.title(first)).toBe('Vivre avec un but');
    expect(service.title(added)).toBe('Respirer');

    TestBed.inject(LanguageService).use('en', false);
    expect(service.title(first)).toBe('Living with purpose');
    expect(service.title(added)).toBe('Breathe');
    expect(service.title({ ...added, title_en: undefined })).toBe('Respirer'); // no English version yet
    expect(service.formatName('video')).toBe('Video');
  });
});
