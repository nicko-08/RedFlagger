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
    if (this.newPassword == this.confirmNewPassword && this.currentPassword) {
      if (this.newPassword === this.confirmNewPassword) {
        this.authService.updatePassword(this.newPassword)
      } else {
        console.error('New password confirmation does not match or incorrect current password');
      }
      //prompt user to enter field if they are empty
      if (!this.currentPassword) {
        console.error('Please enter your current password');
      }
      if (!this.newPassword) {
        console.error('Please enter a new password');
      }
      if (!this.confirmNewPassword) {
        console.error('Please confirm your new password');
      }
    }
  }
}
