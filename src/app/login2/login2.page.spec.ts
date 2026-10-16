import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firebaseFakes } from '../../testing/firebase-fakes';
import { AuthService } from '../services/auth/auth.service';
import { Login2Page } from './login2.page';

describe('Login2Page', () => {
  let component: Login2Page;
  let fixture: ComponentFixture<Login2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Login2Page],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [...firebaseFakes().providers, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Login2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("doesn't try to log in with an invalid form", async () => {
    component.loginForm.setValue({ email: 'not-an-email', password: '123' });
    await component.login();
    expect(TestBed.inject(AuthService).login).not.toHaveBeenCalled();
  });

  it('logs in and opens the app', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.loginForm.setValue({ email: 'me@example.com', password: 'secret123' });
    await component.login();
    expect(TestBed.inject(AuthService).login).toHaveBeenCalledWith('me@example.com', 'secret123');
    expect(navigate).toHaveBeenCalledWith('/tabs/tab1', { replaceUrl: true });
  });

  it('explains a wrong email or password on the page', async () => {
    (TestBed.inject(AuthService).login as jasmine.Spy).and.rejectWith({ code: 'auth/invalid-credential' });
    spyOn(console, 'error');
    component.loginForm.setValue({ email: 'me@example.com', password: 'wrongpass' });
    await component.login();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-error').textContent).toContain("don't match an account");
  });

  it('lets people continue without an account', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.continueWithoutAccount();
    expect(navigate).toHaveBeenCalledWith('/tabs/tab1', { replaceUrl: true });
  });

  it('sends a password reset link for a valid email', async () => {
    expect(await component.sendReset('me@example.com')).toBeTrue();
    expect(TestBed.inject(AuthService).sendPasswordReset).toHaveBeenCalledWith('me@example.com');
  });

  it('keeps the reset box open for an invalid email', async () => {
    expect(await component.sendReset('nope')).toBeFalse();
    expect(TestBed.inject(AuthService).sendPasswordReset).not.toHaveBeenCalled();
  });
});
