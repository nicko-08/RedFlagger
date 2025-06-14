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

  async resetPassword() {
    this.message = '';
    this.error = '';
    const { error } = await this.authService.supabase.auth.resetPasswordForEmail(this.email, {
      redirectTo: 'https://redflagger.site/reset-password'  // 👈 Change this to live URL later
    });
    

    if (error) {
      this.error = error.message;
    } else {
      this.message = 'If this email exists in our system, a reset link has been sent.';
    }
  }
}
