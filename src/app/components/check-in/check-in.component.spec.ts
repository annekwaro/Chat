import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { firebaseFakes, FakeFirestore } from '../../../testing/firebase-fakes';
import { MOODS, MoodService } from 'src/app/services/mood/mood.service';
import { CheckInComponent } from './check-in.component';

describe('CheckInComponent', () => {
  let fixture: ComponentFixture<CheckInComponent>;
  let component: CheckInComponent;
  let firestore: FakeFirestore;
  let modal: jasmine.SpyObj<ModalController>;
  let nav: jasmine.SpyObj<NavController>;

  async function setup(seed?: (key: string) => void) {
    const fakes = firebaseFakes();
    firestore = fakes.firestore;
    modal = jasmine.createSpyObj('ModalController', ['dismiss']);
    modal.dismiss.and.resolveTo(true);
    nav = jasmine.createSpyObj('NavController', ['navigateForward']);
    // IonicModule gives standalone components their own ModalController, so override it everywhere
    TestBed.overrideProvider(ModalController, { useValue: modal });
    await TestBed.configureTestingModule({
      imports: [CheckInComponent, IonicModule.forRoot()],
      providers: [
        ...fakes.providers,
        provideRouter([]),
        { provide: ModalController, useValue: modal },
        { provide: NavController, useValue: nav },
      ],
    }).compileComponents();
    seed?.(TestBed.inject(MoodService).dateKey());
    fixture = TestBed.createComponent(CheckInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('saves the mood, who you were with and a note', async () => {
    await setup();
    expect(fixture.nativeElement.querySelector('.save').disabled).toBeTrue();
    component.selected = MOODS[1];
    component.toggleCompany('Friends');
    component.toggleCompany('Family');
    component.note = '  Walked in the park  ';
    await component.save();

    const key = TestBed.inject(MoodService).dateKey();
    expect(firestore.data.get(`users/test-user/moods/${key}`)).toEqual(
      jasmine.objectContaining({ mood: 'Good', with: ['Family', 'Friends'], note: 'Walked in the park' })
    );
    expect(modal.dismiss).toHaveBeenCalledWith(jasmine.anything(), 'saved');
  });

  it('opens with today’s check-in filled in', async () => {
    await setup((key) =>
      firestore.data.set(`users/test-user/moods/${key}`, { date: key, mood: 'Low', emoji: '😔', with: ['Alone'], note: 'Tired' })
    );
    expect(component.selected?.label).toBe('Low');
    expect(component.withWhom.has('Alone')).toBeTrue();
    expect(component.note).toBe('Tired');
    expect(fixture.nativeElement.querySelector('.save').textContent).toContain('Update');
  });

  it('offers help on a hard day', async () => {
    await setup();
    component.selected = MOODS[4];
    fixture.detectChanges();
    const link: HTMLElement = fixture.nativeElement.querySelector('.help-link');
    expect(link).toBeTruthy();
    await component.getHelp();
    expect(nav.navigateForward).toHaveBeenCalledWith('/help');
  });

  it('keeps the sheet open and explains if saving fails', async () => {
    await setup();
    spyOn(TestBed.inject(MoodService), 'setToday').and.rejectWith(new Error('offline'));
    spyOn(console, 'error');
    component.selected = MOODS[2];
    await component.save();
    expect(component.error).toContain('Couldn’t save');
    expect(modal.dismiss).not.toHaveBeenCalled();
  });
});
