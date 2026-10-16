import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';

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
    expect(labels).toEqual(['Home', 'Explore', 'Discover', 'Chat']);
  });
});
