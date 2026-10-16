import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firebaseFakes, FakeFirestore } from '../../testing/firebase-fakes';
import { MOODS, MoodService } from '../services/mood/mood.service';
import { Tab4Page } from './tab4.page';

describe('Tab4Page (Discover)', () => {
  let fixture: ComponentFixture<Tab4Page>;
  let component: Tab4Page;
  let firestore: FakeFirestore;
  let moods: MoodService;

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return moods.dateKey(d);
  };

  async function setup(seed?: () => void) {
    const fakes = firebaseFakes();
    firestore = fakes.firestore;
    await TestBed.configureTestingModule({
      declarations: [Tab4Page],
      imports: [CommonModule, FormsModule, RouterModule, IonicModule.forRoot()],
      providers: [...fakes.providers, provideRouter([])],
    }).compileComponents();
    moods = TestBed.inject(MoodService);
    seed?.();
    fixture = TestBed.createComponent(Tab4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await component.ionViewWillEnter();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('opens on the Learn section with six topics', async () => {
    await setup();
    expect(component.segment).toBe('learn');
    expect(fixture.nativeElement.querySelectorAll('.condition').length).toBe(6);
  });

  it('builds the diary: today, week strip and streak', async () => {
    await setup(() => {
      for (const [n, mood] of [[0, 'Good'], [1, 'Okay'], [3, 'Low']] as [number, string][]) {
        const m = moods.findMood(mood)!;
        firestore.data.set(`users/test-user/moods/${daysAgo(n)}`, { date: daysAgo(n), mood, emoji: m.emoji });
      }
    });

    expect(component.today?.mood).toBe('Good');
    expect(component.streak).toBe(2); // today + yesterday, then a gap
    expect(component.week.length).toBe(7);
    expect(component.week.filter((d) => d.entry).length).toBe(3);
    expect(component.week[6].isToday).toBeTrue();
  });

  it("counts yesterday's streak when today isn't logged yet", async () => {
    await setup(() => {
      for (const n of [1, 2]) {
        firestore.data.set(`users/test-user/moods/${daysAgo(n)}`, { date: daysAgo(n), mood: 'Okay', emoji: '😐' });
      }
    });
    expect(component.streak).toBe(2);
  });

  it("logs today's mood from the diary", async () => {
    await setup();
    await component.logToday(MOODS[3]);
    expect(firestore.data.get(`users/test-user/moods/${moods.dateKey()}`)?.['mood']).toBe('Low');
    expect(component.today?.mood).toBe('Low');
  });

  it('runs box breathing in 4-second phases and stops cleanly', fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Tab4Page],
      imports: [CommonModule, FormsModule, RouterModule, IonicModule.forRoot()],
      providers: [...firebaseFakes().providers, provideRouter([])],
    });
    const page = TestBed.createComponent(Tab4Page).componentInstance;

    page.toggleBreathing();
    expect(page.phase.label).toBe('Breathe in');
    tick(4000);
    expect(page.phase.label).toBe('Hold');
    tick(12000);
    expect(page.cycles).toBe(1);
    expect(page.phase.label).toBe('Breathe in');

    page.toggleBreathing();
    expect(page.breathing).toBeFalse();
  }));

  it('saves routine changes for today', async () => {
    await setup();
    expect(component.routine.length).toBe(5);

    component.toggleItem(component.routine[0]);
    component.newRoutineItem = 'Journaling';
    component.addItem();
    await fixture.whenStable();

    const saved = firestore.data.get(`users/test-user/routine/${moods.dateKey()}`);
    expect(saved?.['items'].length).toBe(6);
    expect(saved?.['items'][0].done).toBeTrue();
    expect(component.doneCount).toBe(1);
  });

  it("starts a new day from yesterday's list, unticked", async () => {
    await setup(() => {
      firestore.data.set(`users/test-user/routine/${daysAgo(1)}`, {
        date: daysAgo(1),
        items: [{ name: 'Yoga', image: 'x.png', done: true }],
      });
    });
    expect(component.routine).toEqual([{ name: 'Yoga', image: 'x.png', done: false }]);
  });
});
