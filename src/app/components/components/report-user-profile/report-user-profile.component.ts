import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-user-profile',
  imports: [DatePipe, CommonModule],
  templateUrl: './report-user-profile.component.html',
  styleUrl: './report-user-profile.component.css'
})
export class ReportUserProfileComponent {
@Input() userId!: string;
  reports: any[] = [];
  http = inject(HttpClient);
  router = inject(Router);
  loading = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && this.userId) {
      console.log('User ID received:', this.userId);

      this.http
        .get<any>(`https://redflagger-api-10796636392.asia-southeast1.run.app/userProfile?user_id=${this.userId}`)
        .subscribe({
          next: (data) => {
            this.reports = data.reports;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to fetch reviews:', err);
            this.loading = false;
          }
        });
    }
  }

  goToPostReports(postId: number): void {
  const api = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_id=${postId}`;
  this.http.get<any>(api).subscribe({
    next: (data) => {
      if (data.POST_URL) {
        // Navigate using query param
        this.router.navigate(['/post-reports'], {
          queryParams: { input: data.POST_URL }
        });
      }
    },
    error: (err) => {
      console.error('Error fetching post_url:', err);
    }
  });
}
}
