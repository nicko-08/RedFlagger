import { provideHttpClient , HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { empty } from 'rxjs';


@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  signUpForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit() {
    const rawFormValue = this.signUpForm.getRawValue();
    this.authService.register(rawFormValue.email, rawFormValue.username, rawFormValue.password).subscribe((result) =>{
      if (result.error) {
        this.errorMessage = result.error.message;
      } else {
        window.location.replace('check-email');
      }
    });
  }
}
