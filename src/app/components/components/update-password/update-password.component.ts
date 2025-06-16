import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  accessToken: string | null = null;
  newPassword = '';
  message = '';
  error = '';


  async updatePassword() {
    this.message = '';
    this.error = '';

    // Set the access token before calling updateUser password must be must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
    if (this.newPassword.length < 8 || !/[A-Z]/.test(this.newPassword) || !/[a-z]/.test(this.newPassword) || !/\d/.test(this.newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword)) {
      this.error = 'Password must be at least 8 characters long and include a mix of uppercase, lowercase, numbers, and special characters.';
      return;
    }

    this.authService.supabase.auth.setSession({ access_token: this.accessToken!, refresh_token: '' });
    const { error } = await this.authService.supabase.auth.updateUser(
      { password: this.newPassword }
    );

    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Password updated successfully!';
    }
  }

}
