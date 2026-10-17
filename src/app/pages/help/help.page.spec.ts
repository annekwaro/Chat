import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HelpPage } from './help.page';
import { HELPLINES } from './helplines';

describe('HelpPage', () => {
  let fixture: ComponentFixture<HelpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPage, IonicModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HelpPage);
    fixture.detectChanges();
  });

  it('offers the emergency number and every helpline as a call link', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect((el.querySelector('.emergency ion-button') as any).href).toBe('tel:112');
    const lines = el.querySelectorAll('.line');
    expect(lines.length).toBe(HELPLINES.length);
    expect((lines[0] as any).href).toBe('tel:' + HELPLINES[0].tel);
  });

  it('says chat is peer support, not a crisis service', () => {
    expect(fixture.nativeElement.querySelector('.note').textContent).toContain('not a crisis');
  });
});
