import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firebaseFakes, FakeFirestore } from '../../testing/firebase-fakes';
import { MOODS, MoodService } from '../services/mood/mood.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page (Home)', () => {
  let fixture: ComponentFixture<Tab1Page>;
  let component: Tab1Page;
  let firestore: FakeFirestore;

  async function setup(uid: string | null = 'test-user', guest = false) {
    const fakes = firebaseFakes({ uid, guest });
    firestore = fakes.firestore;
    firestore.data.set('users/test-user', { name: 'Anne Kwaro', photo: 'me.png' });
    await TestBed.configureTestingModule({
      imports: [Tab1Page, IonicModule.forRoot()],
      providers: [...fakes.providers, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // The carousel's autoplay timer keeps the zone busy, so wait for the data instead of whenStable()
    for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  it('greets the user by first name with their photo', async () => {
    await setup();
    expect(component.userName).toBe('Anne');
    expect(component.userPhoto).toBe('me.png');
    expect(fixture.nativeElement.querySelector('.greeting-name').textContent).toContain('Anne');
  });

  it('shows the six "for you" insights and filters them by format', async () => {
    await setup();
    expect(component.filteredInsights.length).toBe(6);

    component.selectCategory('podcast');
    expect(component.filteredInsights.length).toBeGreaterThan(0);
    expect(component.filteredInsights.every((i) => i.format === 'podcast')).toBeTrue();
  });

  it('searches insights by title or topic', async () => {
    await setup();
    component.onSearch({ detail: { value: 'Sleep' } });
    expect(component.filteredInsights.map((i) => i.title)).toEqual(['Wind down for sleep']);
  });

  it("saves the mood check-in to today's diary entry", async () => {
    await setup();
    await component.selectMood(MOODS[0]);
    const key = TestBed.inject(MoodService).dateKey();
    expect(firestore.data.get(`users/test-user/moods/${key}`)?.['mood']).toBe('Great');

    // tapping the same mood again clears it
    await component.selectMood(MOODS[0]);
    expect(firestore.data.has(`users/test-user/moods/${key}`)).toBeFalse();
  });

  it('shows initials when the user has no photo', async () => {
    await setup();
    firestore.data.set('users/test-user', { name: 'anne kwaro' });
    await component.handleRefresh({ target: { complete: () => {} } });
    expect(component.initials).toBe('AK');
  });

  it('ignores the old random stock photo and shows initials instead', async () => {
    await setup();
    firestore.data.set('users/test-user', { name: 'Anne Kwaro', photo: 'https://i.pravatar.cc/300' });
    await component.handleRefresh({ target: { complete: () => {} } });
    expect(component.userPhoto).toBe('');
  });

  it('flags the bell until today\'s mood is checked in', async () => {
    await setup();
    expect(component.needsCheckIn).toBeTrue();
    await component.selectMood(MOODS[1]);
    expect(component.needsCheckIn).toBeFalse();
  });

  it('shows guests a dismissible note about creating an account', async () => {
    localStorage.removeItem('guestNoteDismissed');
    await setup('guest-user', true);
    expect(fixture.nativeElement.querySelector('.guest-note')).not.toBeNull();

    component.dismissGuestNote();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.guest-note')).toBeNull();
    localStorage.removeItem('guestNoteDismissed');
  });

  it("doesn't show the guest note to people with an account", async () => {
    await setup();
    expect(fixture.nativeElement.querySelector('.guest-note')).toBeNull();
  });

  it("doesn't save a mood when logged out", async () => {
    await setup(null);
    await component.selectMood(MOODS[0]);
    expect([...firestore.data.keys()].some((k) => k.includes('/moods/'))).toBeFalse();
  });
});
