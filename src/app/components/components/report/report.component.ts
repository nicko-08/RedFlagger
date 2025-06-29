import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  reportForm: FormGroup;
  images: File[] = [];
  previewUrls: string[] = [];
  imageError: string | null = null;
  userLink: string | null = null;
  submitting = false;

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  session = this.authService.getSession();
  router = inject(Router);

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      pageLink: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userLink = params['link'] || null;

      if (this.userLink) {
        this.reportForm.patchValue({ pageLink: this.userLink });
        this.reportForm.get('pageLink')?.disable();
      }
    });
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const files = Array.from(target.files);

    if (files.length > 3) {
      this.imageError = 'You can upload a maximum of 3 images.';
      alert('You can upload a maximum of 3 images.');
      return;
    }

    this.imageError = null;

    files.forEach((file) => {
      const isDuplicate = this.images.some(existing =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.type === file.type
      );
      
      if (isDuplicate) {
        alert("Duplicate image detected. Please select a different image.");
        console.error("Duplicate file blocked:", file.name);
        return;
      }

        
      this.images.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    
    this.fileInputRef.nativeElement.value = '';
  }

  removeImage(url: string): void {
    const index = this.previewUrls.indexOf(url);
    if (index !== -1) {
      this.previewUrls.splice(index, 1);
      this.images.splice(index, 1);
    }

    
    this.fileInputRef.nativeElement.value = '';
  }

  async onSubmit(): Promise<void> {
    this.submitting = true;

    if (this.reportForm.valid && this.images.length <= 3) {
      const baseUrl = 'https://redflagger-api-10796636392.asia-southeast1.run.app/report/new';
      const postUrl = encodeURIComponent(this.reportForm.get('pageLink')?.value);
      const content = encodeURIComponent(this.reportForm.value.content);
      const apiUrl = `${baseUrl}?post_url=${postUrl}&content=${content}`;

      const formData = new FormData();
      this.images.forEach((file) => {
        formData.append('images', file);
      });

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        alert('Failed to retrieve access token. Please log in again.');
        this.router.navigate(['/home']);
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });

      this.http.post(apiUrl, formData, { headers }).subscribe({
        next: (response: any) => {
          alert('Report submitted successfully!');
          this.userLink = this.reportForm.get('pageLink')?.value;
          this.reportForm.reset();
          this.images = [];
          this.previewUrls = [];
          this.fileInputRef.nativeElement.value = '';
          this.router.navigate(['information'], { queryParams: { input: this.userLink } });
          this.submitting = false;
        },
        error: (error: any) => {
          console.error('Error submitting the report:', error);
          alert('Failed to submit the report. Please try again.');
          this.submitting = false;
        },
      });
    }
  }

  private async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }

  prevPage(): void {
    this.router.navigate(['post-reports'], { queryParams: { input: this.userLink } });
  }
}
