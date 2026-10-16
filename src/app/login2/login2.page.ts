import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute
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
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return "Can't reach the server. Check your connection and try again.";
      default:
        return 'Could not log you in. Please try again.';
    }
  }
}
