import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReportSyncService } from '../../../report-sync.service';

@Component({
  selector: 'app-post-reports-admin',
  imports: [CommonModule,],
  templateUrl: './post-reports-admin.component.html',
  styleUrl: './post-reports-admin.component.css',
  animations: [
  trigger('fadeInOut', [
    transition(':leave', [
      animate('0.3s ease-in', style({ opacity: 0, height: 0 }))
    ]),
    transition(':enter', [
      style({ opacity: 0, height: 0 }),
      animate('0.3s ease-out', style({ opacity: 1, height: '*' }))
    ])
  ])
]
})
export class PostReportsAdminComponent {
toastMessage: string | null = null;
toastType: 'success' | 'error' = 'success';
loadingRecoverIds: string[] = [];
reports: any[] = [];
isLoading: boolean = true;
@Input() postUrl!: string;

http = inject(HttpClient);
authServe = inject(AuthService);
reportSyncService = inject(ReportSyncService)

async ngOnInit(): Promise<void> {
  if (this.postUrl) {
    const token = await this.authServe.getAccessToken();
    if (token) {
      this.fetchReports(this.postUrl, token);
    } else {
      console.error('No access token found');
    }
  }
}


fetchReports(postUrl: string, token: string): void {
  this.isLoading = true;
  const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/archive/reports?post_url=${encodeURIComponent(postUrl)}`;

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get(apiUrl, { headers }).subscribe({
    next: async (data: any) => {
      this.reports = data;

      for (const report of this.reports) {
        try {
          report.PROFILE_IMAGE = await this.getProfileImage(report.USER_ID);
          console.log(`User ID: ${report.USER_ID}, profileImage: ${report.PROFILE_IMAGE}`);
        } catch (error) {
          report.PROFILE_IMAGE = 'default';
        }
      }

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to fetch reports:', err);
      this.isLoading = false;
    }
  });
  
}

async getProfileImage(userId: string): Promise<string> {
  try {
    const response = await firstValueFrom(
      this.http.get<any>(`https://redflagger-api-10796636392.asia-southeast1.run.app/userProfile?user_id=${userId}`)
    );
    return response.user.PROFILE_IMAGE || 'default';
  } catch (error) {
    console.error('Failed to get Profile Picture', error);
    return 'default';
  }
}

async recoverReport(reportId: string): Promise<void> {
  const token = await this.authServe.getAccessToken();
  if (!token) {
    this.showToast('Missing access token', 'error');
    return;
  }

  if (!confirm('Are you sure you want to recover this report?')) return;

  this.loadingRecoverIds.push(reportId);
  const url = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/report/restore/${reportId}?post_url=${encodeURIComponent(this.postUrl)}`;
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.delete(url, { headers }).subscribe({
    next: () => {
      this.reports = this.reports.filter(r => r.REPORT_ID !== reportId);
      this.showToast('Report successfully restored.', 'success');
      this.loadingRecoverIds = this.loadingRecoverIds.filter(id => id !== reportId);
    },
    error: (err) => {
      console.error('Failed to restore report', err);
      this.showToast('Failed to restore report.', 'error');
      this.loadingRecoverIds = this.loadingRecoverIds.filter(id => id !== reportId);
    }
  });
}

showToast(message: string, type: 'success' | 'error') {
  this.toastMessage = message;
  this.toastType = type;
  setTimeout(() => {
    this.toastMessage = null;
  }, 3000);
}
downloadReport(postId: string): void {
  if (this.isLoading) return;

  const url = `https://redflagger-api-10796636392.asia-southeast1.run.app/download?post_id=${postId}`;
  window.open(url, '_blank');
}



}
