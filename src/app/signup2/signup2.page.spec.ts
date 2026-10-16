import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firebaseFakes } from '../../testing/firebase-fakes';
import { AuthService } from '../services/auth/auth.service';
import { Signup2Page } from './signup2.page';

describe('Signup2Page', () => {
  let component: Signup2Page;
  let fixture: ComponentFixture<Signup2Page>;

  async function setup(params: Record<string, string> = {}, guest = false) {
    await TestBed.configureTestingModule({
      declarations: [Signup2Page],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        ...firebaseFakes({ uid: guest ? 'guest-user' : null, guest }).providers,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Signup2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const fill = () =>
    component.signupForm.setValue({ username: 'Anne', email: 'anne@example.com', password: 'secret123' });

  it('explains why when sent from Chat, and tells guests their data comes along', async () => {
    await setup({ reason: 'chat', returnUrl: '/tabs/home' }, true);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Chat with a therapist');
    expect(text).toContain('Your mood diary and routine come with you');
  });

  it('creates the account and returns to where the user was going', async () => {
    await setup({ reason: 'chat', returnUrl: '/tabs/home' }, true);
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    fill();
    await component.signUp();
    expect(TestBed.inject(AuthService).register).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/tabs/home', { replaceUrl: true });
  });

  it('shows a helpful message when the email is taken', async () => {
    await setup();
    (TestBed.inject(AuthService).register as jasmine.Spy).and.rejectWith({ code: 'auth/email-already-in-use' });
    spyOn(console, 'error');
    fill();
    await component.signUp();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-error').textContent).toContain('Try logging in');
  });

  it('"Not now" from Chat goes Home instead of back to Chat', async () => {
    await setup({ reason: 'chat', returnUrl: '/tabs/home' }, true);
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.notNow();
    expect(navigate).toHaveBeenCalledWith('/tabs/tab1', { replaceUrl: true });
  });
});
