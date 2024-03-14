import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  form: FormGroup;
  isTypePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    this.initForm();
  }

  ngOnInit() {}
  initForm() {
    this.form = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  onChange() {
    this.isTypePassword = !this.isTypePassword;
  }

  onSubmit() {
    if (!this.form.valid) return;
    console.log(this.form.value);
    this.register(this.signUpForm);
    //this.isLogin(this.form);
  }
  signUpForm(signUpForm: any) {
    throw new Error('Method not implemented.');
  }
  register(form) {
    this.isLoading = true;
    this.authService
      .register(form.value)
      .then((data: any) => {
        console.log(data);
        this.router.navigate(['/tab1']);
        this.isLoading = false;
        form.reset();
      })
      .catch((e) => {
        this.isLoading = false;
        console.log(e); //this is global hideLoader();
        let msg: string = 'Please try again';
        if (e.code == 'email already in use') {
          msg = e.message;
        }
        this.showAlert(msg);
      });
  }
  async showAlert(msg) {
    const alert = await this.alertController.create({
      header: 'A Short Title Is Best',
      subHeader: 'A Sub Header Is Optional',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
