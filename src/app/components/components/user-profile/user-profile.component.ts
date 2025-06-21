import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { ReportUserProfileComponent } from '../report-user-profile/report-user-profile.component';
import { ReviewUserProfileComponent } from '../review-user-profile/review-user-profile.component';
import { HttpClient } from '@angular/common/http';
import { ProfileImageSelectComponent } from "../profile-image-select/profile-image-select.component";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [CommonModule, ReportUserProfileComponent, ReviewUserProfileComponent, ProfileImageSelectComponent]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  username: string | null = null;
  userId: string = '';
  activeTab: 'reports' | 'reviews' = 'reports';
  authService = inject(AuthService);
  router = inject(Router);
  showPopup = false;

  private authSub?: Subscription;

  userProfileImage = "default";
  userProfileForeground = "white";
  userProfileBackgroud = "red";

  http = inject(HttpClient);

  ngOnInit() {
    this.authService.supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        this.username = data.user.user_metadata['username'] || null;
        this.userId = data.user.id || '';
        this.getUserInfo();
      } else {
        this.router.navigate(['/home']);
      }
    });

    //Subscribe to auth state changes to detect logout dynamically//
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed//
    this.authSub?.unsubscribe();
  }

  goToSettings() {
    this.router.navigate(['/profile-settings']);
  }

  getUserInfo(){
    this.http
      .get<any>(`https://redflagger-api-10796636392.asia-southeast1.run.app/userProfile?user_id=${this.userId}`)
      .subscribe({
        next: (data) => {
          console.log(data)
          this.userProfileImage = data.user.PROFILE_IMAGE;
          console.log(this.userProfileImage);
        },
        error: (err) => {
          console.error('Failed to fetch reviews:', err);
        }
      });
  }
  onImageSaved(){
    console.log("detected image change");
    this.getUserInfo();
  }
}
