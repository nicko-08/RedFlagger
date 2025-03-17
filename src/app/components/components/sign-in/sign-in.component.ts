import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  signInForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit() {
    const rawFormValue = this.signInForm.getRawValue();
    this.authService.login(rawFormValue.email, rawFormValue.password).subscribe((result) =>{
      if (result.error) {
        this.errorMessage = result.error.message;
      } else {

        this.authService.supabase.auth.onAuthStateChange((event) => {

        })
        window.location.replace('/home');
      }
    });
  }
  
}
