import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule,FormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {
username: string = '';
  showUsernameForm = true;
  newUsername = '';
  confirmPassword1 = '';
  confirmPassword2 = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  private authSub?: Subscription;

  

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.authService.logout();
  }

  saveChanges() { 
    if (this.newUsername && this.confirmPassword1 && this.confirmPassword2) {
      this.updateUsername();
      return;
    }
    if (this.newPassword && this.confirmNewPassword && this.currentPassword) {
      this.updatePassword();
      return;
    }
  }

  updateUsername() {
    //check if new username is provided and  current password matches to the user's password
    if (this.newUsername && this.confirmPassword1 === this.confirmPassword2) {
      this.authService.supabase.auth.updateUser({
        data: { username: this.newUsername }
      }).then(({ error }) => {
        if (error) {
          console.error('Error updating username:', error.message);
        } else {
          this.showUsernameForm = false;
          console.log('Username updated successfully');
        }
      });
    } else {
      console.error('New username or password confirmation does not match');
    }
  }

  updatePassword() {
    if (this.newPassword && this.confirmNewPassword && this.currentPassword) {
      if (this.newPassword === this.confirmNewPassword) {
        this.authService.supabase.auth.updateUser({
          password: this.newPassword
        }).then(({ error }) => {
          if (error) {
            console.error('Error updating password:', error.message);
          } else {
            console.log('Password updated successfully');
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
          }
        });
      } else {
        console.error('New password confirmation does not match');
      }
    } else {
      console.error('Please fill in all fields');
    }
  }
}
