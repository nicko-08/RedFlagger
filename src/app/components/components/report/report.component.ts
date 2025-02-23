import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-report',
  imports:[ReactiveFormsModule, CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  reportForm: FormGroup;
  images: File[] = [];
  previewUrls: string[] = [];
  imageError: string | null = null;
  authService = inject(AuthService);
  session = this.authService.getSession();

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      pageLink: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
      content: ['', Validators.required],
    });
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const files = Array.from(target.files);

    // Alert and set an error if the user selects more than 3 images
    if (files.length > 3) {
      this.imageError = 'You can upload a maximum of 3 images.';
      alert('You can upload a maximum of 3 images.');
      return;
    }

    // Clear any previous data
    
    this.imageError = null;

    // Process each file to generate its preview
    files.forEach((file) => {
      this.images.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.reportForm.valid && this.images.length <= 3) {
      const baseUrl = 'https://redflagger-api-10796636392.asia-southeast1.run.app/report/new';
      const postUrl = encodeURIComponent(this.reportForm.value.pageLink);
      const content = encodeURIComponent(this.reportForm.value.content);
      const apiUrl = `${baseUrl}?post_url=${postUrl}&content=${content}`;

      const formData = new FormData();
      this.images.forEach((file) => {
        formData.append('images', file);
      });

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        alert('Failed to retrieve access token. Please log in again.');
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });

      this.http.post(apiUrl, formData, { headers }).subscribe({
        next: (response: any) => {
          console.log('Report submitted successfully', response);
          alert('Report submitted successfully!');
          this.reportForm.reset();
          this.images = [];
          this.previewUrls = [];
        },
        error: (error: any) => {
          console.error('Error submitting the report:', error);
          alert('Failed to submit the report. Please try again.');
        },
      });
    }
  }

  private async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }
}
