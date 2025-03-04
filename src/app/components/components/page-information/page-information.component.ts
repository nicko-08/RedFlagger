import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-page-information',
  imports: [],
  templateUrl: './page-information.component.html',
  styleUrl: './page-information.component.css'
})
export class PageInformationComponent implements OnInit{
  
pageName: string | null = null;
userInputUrl: string | null = null;
fbEmbedUrl: SafeResourceUrl | null = null;
reportTotal: number | null = null;
peakReport: number | null = null;
averagePostCount: string | null = null;
threatLevel: string | null = null;

sanitizer = inject(DomSanitizer);
http = inject(HttpClient);
route = inject(ActivatedRoute);

  ngOnInit(): void {
      this.route.queryParams.subscribe((params) => {
        this.userInputUrl = params['input'];
        if(this.userInputUrl){
          this.callApi(this.userInputUrl);
          this.getPageContent(this.userInputUrl);
          
        }
      });
      this.route.queryParams.subscribe((params)=>{
        const input = params['input'];
        if(input){
          const fbPageUrl = 'https://www.facebook.com/plugins/page.php?href=';
          this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${encodeURIComponent(input)}&width=100%`);
          console.log('FB embed URL:', this.fbEmbedUrl);
        }
      })
  }

  callApi(input: string): void{
    console.log('Calling API with input:', input);
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(input)}`;
  }

  getPageContent(input: string): void {

    if(!this.userInputUrl){
      alert('Please enter a valid URL');
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(this.userInputUrl)}`;
    const apiPageStatsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page/stats?page_url=${encodeURIComponent(this.userInputUrl)}`;
    this.http.get<{ PAGE_NAME: string }>(apiUrl).subscribe({
      next: (response) => {
        this.pageName = response.PAGE_NAME || 'No content available for this post'; // Extract post_content from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.pageName = 'Failed to fetch post content. Please try again.';
      }
    });

    this.http.get<{ total_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        console.log('Total reports:', response.total_reports);
        this.reportTotal = response.total_reports || 0;// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.reportTotal = null;
      }
    
    });

    this.http.get<{ average_daily_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.averagePostCount = (response.average_daily_reports ?? 0).toFixed(1) // Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.averagePostCount = null;
      }
    });

    this.http.get<{ peak_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.peakReport = response.peak_reports || 0// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.peakReport = null;
      }
    });

    this.http.get<{threat: {threat_level: number} }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.threatLevel = (response.threat?.threat_level ?? 0).toFixed(1)// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.threatLevel = null;
      }
    });

  }
}