import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, SimpleChanges } from '@angular/core';

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
}
