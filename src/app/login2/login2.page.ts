import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login2',
  templateUrl: './login2.page.html',
  styleUrls: ['./login2.page.scss'],
})
export class Login2Page implements OnInit {
  loginForm: FormGroup;
  returnUrl = '/tabs/tab1';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alerts: AlertController,
    private toasts: ToastController
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
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.authService.login(email, password);
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (error: any) {
      console.error('Login error', error);
      this.errorMessage = this.describeError(error?.code);
    } finally {
      this.isLoading = false;
    }
  }

  // Asks for the email (filled in from the form) and sends Firebase's reset link
  async forgotPassword() {
    const alert = await this.alerts.create({
      header: 'Reset your password',
      message: 'We’ll email you a link to choose a new password.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.loginForm.value.email || '',
          attributes: { autocomplete: 'email' },
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Send link', handler: (data) => this.sendReset((data?.email || '').trim()) },
      ],
    });
    await alert.present();
  }

  // Returns false to keep the alert open when the email isn't valid
  async sendReset(email: string): Promise<boolean> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showToast('Enter a valid email address.', 'danger');
      return false;
    }
    try {
      await this.authService.sendPasswordReset(email);
      this.showToast(`If ${email} has an account, a reset link is on its way. Check your inbox.`);
      return true;
    } catch (error: any) {
      this.showToast(this.describeError(error?.code), 'danger');
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
        return "That email and password don't match an account.";
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return "Can't reach the server. Check your connection and try again.";
      default:
        return 'Could not log you in. Please try again.';
    }
  }
}
