import { AuthService } from '../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup2',
  templateUrl: './signup2.page.html',
  styleUrls: ['./signup2.page.scss'],
})
export class Signup2Page implements OnInit {
  signupForm: FormGroup;
  showPassword = false;
  isLoading: boolean = false;
  errorKey = ''; // a translation key, so the message follows the language
  errorCode = '';
  returnUrl = '/tabs/tab1';
  reason: string | null = null; // 'chat' when sent here from the Chat tab
  isGuest = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    this.returnUrl = params.get('returnUrl') || '/tabs/tab1';
    this.reason = params.get('reason');
    this.isGuest = this.authService.isGuest();
  }

  initForm() {
    this.signupForm = new FormGroup({
      username: new FormControl('', { validators: [Validators.required] }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  // This is the method called by the form submit
  async signUp() {
    if (!this.signupForm.valid) return;
    this.isLoading = true;
    this.errorKey = '';
    this.errorCode = '';
    try {
      // A guest's diary and routine carry over to the new account
      await this.authService.register(this.signupForm.value);
      this.signupForm.reset();
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (error: any) {
      console.error('Registration error', error);
      this.errorKey = this.describeError(error?.code);
    } finally {
      this.isLoading = false;
    }
  }

  notNow() {
    // Chat is the page that needed an account, so go home instead of back there
    const back = this.reason === 'chat' ? '/tabs/tab1' : this.returnUrl;
    this.router.navigateByUrl(back, { replaceUrl: true });
  }

  private describeError(code: string | undefined): string {
    switch (code) {
      case 'auth/email-already-in-use':
      case 'auth/credential-already-in-use':
        return 'auth.errors.emailInUse';
      case 'auth/invalid-email':
        return 'auth.errors.invalidEmail';
      case 'auth/weak-password':
        return 'auth.errors.weakPassword';
      case 'auth/network-request-failed':
        return 'auth.errors.network';
      default:
        // The code helps tell what went wrong (e.g. permission-denied from Firestore)
        this.errorCode = code || '';
        return 'auth.errors.signupFailed';
    }
  }
}
