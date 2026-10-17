import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';
import { CheckInService } from '../components/check-in/check-in.service';

describe('TabsPage', () => {
  it('shows the four tabs', async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPage, IonicModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TabsPage);
    fixture.detectChanges();

    const labels = [...fixture.nativeElement.querySelectorAll('ion-tab-button')].map((b: HTMLElement) =>
      b.textContent?.trim()
    );
    expect(labels).toEqual(['Accueil', 'Explorer', 'Découvrir', 'Messages']);
  });

  it('opens the daily check-in from the + button', async () => {
    const open = jasmine.createSpy('open').and.resolveTo(true);
    await TestBed.configureTestingModule({
      imports: [TabsPage, IonicModule.forRoot()],
      providers: [provideRouter([]), { provide: CheckInService, useValue: { open } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TabsPage);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.check-in-button').click();
    expect(open).toHaveBeenCalled();
  });
});
