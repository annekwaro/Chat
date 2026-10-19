import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { LanguageService } from '../i18n/language.service';

@Component({
  selector: 'app-login2',
  templateUrl: './login2.page.html',
  styleUrls: ['./login2.page.scss'],
})
export class Login2Page implements OnInit {
  loginForm: FormGroup;
  returnUrl = '/tabs/tab1';
  errorKey = ''; // a translation key, so the message follows the language
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alerts: AlertController,
    private toasts: ToastController,
    private language: LanguageService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    // e.g. sent here from Chat, so go back there after logging in
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/tabs/tab1';
  }

  async login() {
    if (!this.loginForm.valid) return;
    const { email, password } = this.loginForm.value;
    this.errorKey = '';
    this.isLoading = true;
    try {
      await this.authService.login(email, password);
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (error: any) {
      console.error('Login error', error);
      this.errorKey = this.describeError(error?.code);
    } finally {
      this.isLoading = false;
    }
  }

  // Asks for the email (filled in from the form) and sends Firebase's reset link
  async forgotPassword() {
    const alert = await this.alerts.create({
      header: this.t('login.resetTitle'),
      message: this.t('login.resetMessage'),
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: this.t('auth.email'),
          value: this.loginForm.value.email || '',
          attributes: { autocomplete: 'email' },
        },
      ],
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('login.sendLink'), handler: (data) => this.sendReset((data?.email || '').trim()) },
      ],
    });
    await alert.present();
  }

  // Returns false to keep the alert open when the email isn't valid
  async sendReset(email: string): Promise<boolean> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showToast(this.t('auth.errors.invalidEmail'), 'danger');
      return false;
    }
    try {
      await this.authService.sendPasswordReset(email);
      this.showToast(this.t('login.resetSent', { email }));
      return true;
    } catch (error: any) {
      this.showToast(this.t(this.describeError(error?.code)), 'danger');
      return false;
    }
  }

  private async showToast(message: string, color?: string) {
    const toast = await this.toasts.create({ message, duration: 4000, position: 'top', color });
    await toast.present();
  }

  continueWithoutAccount() {
    this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
  }

  private describeError(code: string | undefined): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'auth.errors.wrongCredentials';
      case 'auth/invalid-email':
        return 'auth.errors.invalidEmail';
      case 'auth/too-many-requests':
        return 'auth.errors.tooManyRequests';
      case 'auth/network-request-failed':
        return 'auth.errors.network';
      default:
        return 'auth.errors.loginFailed';
    }
  }

  private t(key: string, params?: Record<string, any>): string {
    return this.language.translate(key, params);
  }
}
