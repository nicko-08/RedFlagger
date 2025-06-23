import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  authService = inject(AuthService);

  email = '';
  message = '';
  error = '';
  isResetting = false;

  async resetPassword() {
    this.isResetting = true;
    this.message = '';
    this.error = '';

    try {
      const { error } = await this.authService.supabase.auth.resetPasswordForEmail(this.email, {
        redirectTo: 'http://redflagger.site/update-password'
    });

    if (error) {
      this.error = error.message;
    } else {
      this.message = 'If this email exists in our system, a reset link has been sent.';
    }
    } catch (err) {
    this.error = 'Something went wrong. Please try again later.';
    }

    this.isResetting = false; // Re-enable if you want to allow re-clicking
  }

  ngOnInit() {
    
  }

}
