import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-signup2',
  templateUrl: './signup2.page.html',
  styleUrls: ['./signup2.page.scss'],
})
export class Signup2Page implements OnInit {
  signupForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  async signUp() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      try {
        const result = await this.authService.signUp(email, password);
        console.log(result);
        // Navigate to login or direct to dashboard after signup
        this.router.navigate(['/login2']);
      } catch (error) {
        console.error(error);
        // Handle signup error (e.g., show a message)
      }
    }
  }
}
