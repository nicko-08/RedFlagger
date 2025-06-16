import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { ReportUserProfileComponent } from '../report-user-profile/report-user-profile.component';
import { ReviewUserProfileComponent } from '../review-user-profile/review-user-profile.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [CommonModule, ReportUserProfileComponent, ReviewUserProfileComponent]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  username: string | null = null;
  userId: string = '';
  activeTab: 'reports' | 'reviews' = 'reports';
  authService = inject(AuthService);
  router = inject(Router);

  private authSub?: Subscription;

  iconFileName = 'default.svg';
  iconColor = 'bg-red-500';
  bgColor = 'bg-blue-500';

  ngOnInit() {
    this.authService.supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        this.username = data.user.user_metadata['username'] || null;
        this.userId = data.user.id || '';
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
}
