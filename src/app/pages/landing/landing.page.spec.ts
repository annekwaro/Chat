import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { LandingPage } from './landing.page';

describe('LandingPage', () => {
  async function setup(uid: string | null) {
    await TestBed.configureTestingModule({
      imports: [LandingPage, IonicModule.forRoot()],
      providers: [...firebaseFakes({ uid }).providers, provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    return fixture;
  }

  it('lets new visitors start without an account', async () => {
    const fixture = await setup(null);
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl');
    await fixture.componentInstance.ionViewWillEnter();

    expect(navigate).not.toHaveBeenCalled();
    const buttons = [...fixture.nativeElement.querySelectorAll('ion-button')].map((b: HTMLElement) => b.textContent?.trim());
    expect(buttons).toEqual(['Get started', 'I already have an account']);
  });

  it('sends returning visitors straight into the app', async () => {
    const fixture = await setup('guest-user');
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    await fixture.componentInstance.ionViewWillEnter();
    expect(navigate).toHaveBeenCalledWith('/tabs/tab1', { replaceUrl: true });
  });
});
