import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  http = inject(HttpClient);

  @Output() closePopup = new EventEmitter<void>();
  

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
    if (this.newUsername) {
      this.updateUsername();
      return;
    }
  }

  updateUsername() {
    //check if new username is provided and  current password is correct
    if (this.newUsername) {
      this.authService.supabase.auth.updateUser({
        data: { username: this.newUsername }
      }).then(({ error }) => {
        if (error) {
          console.error('Error updating username:', error.message);
        } else {
          console.log('Username updated successfully');
          this.authService.updateUsernameLocally(this.newUsername);
        }
      });

      this.changeDatabaseUsername(this.newUsername);

    } else {
      console.error('New username or password confirmation does not match');
    }
  }

  async changeDatabaseUsername(username:string){
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      alert('Failed to retrieve access token. Please log in again.');
      this.router.navigate(['/home'])
      return;
      }
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/user/update?username=${encodeURIComponent(username)}`;
    console.log(apiUrl);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    this.http.put(apiUrl, {}, { headers }).subscribe({
      next: (response: any) => {
        console.log('changed');
        this.close();
      },
      error: (error: any) => {
        console.error('Error Changing Username');
      }
    });
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }
  
  close(){
    this.closePopup.emit();
  }
}
