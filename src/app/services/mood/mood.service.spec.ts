import { TestBed } from '@angular/core/testing';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { MOODS, MoodService, moodLabel, companyLabel } from './mood.service';

describe('MoodService', () => {
  function setup(uid: string | null = 'test-user') {
    const fakes = firebaseFakes({ uid });
    TestBed.configureTestingModule({ providers: fakes.providers });
    return { service: TestBed.inject(MoodService), firestore: fakes.firestore };
  }

  it('formats date keys as YYYY-MM-DD with padding', () => {
    const { service } = setup();
    expect(service.dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it("saves today's mood and keeps an existing note", async () => {
    const { service, firestore } = setup();
    const path = `users/test-user/moods/${service.dateKey()}`;
    firestore.data.set(path, { note: 'Long walk' });

    await service.setToday(MOODS[1]);

    expect(firestore.data.get(path)).toEqual(
      jasmine.objectContaining({ mood: 'Good', emoji: '🙂', note: 'Long walk', date: service.dateKey() })
    );
    expect((await service.getToday())?.mood).toBe('Good');
  });

  it("clears today's mood", async () => {
    const { service } = setup();
    await service.setToday(MOODS[0]);
    await service.clearToday();
    expect(await service.getToday()).toBeNull();
  });

  it('returns history newest first, limited', async () => {
    const { service, firestore } = setup();
    for (const date of ['2026-10-01', '2026-10-03', '2026-10-02']) {
      firestore.data.set(`users/test-user/moods/${date}`, { date, mood: 'Okay', emoji: '😐' });
    }
    const history = await service.getHistory(2);
    expect(history.map((e) => e.date)).toEqual(['2026-10-03', '2026-10-02']);
  });

  it('refuses to read or write when logged out', async () => {
    const { service } = setup(null);
    await expectAsync(service.setToday(MOODS[0])).toBeRejectedWithError('not-logged-in');
  });

  it('finds moods by label', () => {
    const { service } = setup();
    expect(service.findMood('Low')?.emoji).toBe('😔');
    expect(service.findMood('Unknown')).toBeNull();
  });

  it('shows French labels for the English keys saved in Firestore', () => {
    expect(moodLabel('Great')).toBe('Super');
    expect(moodLabel('Awful')).toBe('Très mal');
    expect(companyLabel('Family')).toBe('Famille');
    expect(MOODS.find((m) => m.key === 'Okay')?.label).toBe('Moyen');
  });
});
