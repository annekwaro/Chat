import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AutheticationService } from 'src/app/authetication.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  regForm: FormGroup;
  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public authService: AutheticationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.regForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  get errorControl() {
    return this.regForm.controls;
  }
  async signUp() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if (this.regForm?.valid) {
      const user = await this.authService
        .registerUser(this.regForm.value.email, this.regForm.value.password)

        .catch((error) => {
          console.log(error);
          loading.dismiss();
        });
      if (user) {
        loading.dismiss();
        this.router.navigate(['/home']);
      } else {
        console.log('Please provide a valid email');
      }
    }
  }
}
