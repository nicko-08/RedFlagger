import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
export class UserProfileComponent {
  username: string | null = null;
  userId: string = '';
  activeTab: 'reports' | 'reviews' = 'reports';
  authService = inject(AuthService);
  router = inject(Router);
  ngOnInit() {
    const user = this.authService.supabase.auth.getUser();
    user.then(({ data }) => {
      if (data?.user) {
        this.username = data.user.user_metadata['username'] || null;
        this.userId = data.user.id || '';
      }
    });
  }

  goToSettings() {
    this.router.navigate(['/profile-settings']);
  }
}