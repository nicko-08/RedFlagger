import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageInformationComponent } from "../page-information/page-information.component";
import { SharedService } from '../../../shared.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-information',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {
isLoggedIn = false;
userInputUrl: string | null = null;
postContent: string | null = null;
reportTotal: number | null = null;
fbEmbedUrl: SafeResourceUrl | null = null;
averagePostCount: string | null = null;
threatLevel: string | null = null; //this is needed to be a string to display the threat level decimal in the UI
peakReport: number | null = null;

authService = inject(AuthService);
http = inject(HttpClient);
route = inject(ActivatedRoute);
sharedService = inject(SharedService);
sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
      const session =  this.authService.getSession();
      this.isLoggedIn = !!session;
      console.log('Is logged in:', this.isLoggedIn);
      this.route.queryParams.subscribe((params) => {
        this.userInputUrl = params['input'];
        if(this.userInputUrl){
          this.callApi(this.userInputUrl);
          this.getPostContent(this.userInputUrl);
        }
      });
      this.route.queryParams.subscribe((params)=>{
        const input = params['input'];
        if(input){
          const fbPageUrl = 'https://www.facebook.com/plugins/post.php?href=';
          this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${encodeURIComponent(input)}&width=100%`);
          console.log('FB embed URL:', this.fbEmbedUrl);
        }
      })
  }

  callApi(input: string): void {
    console.log('Calling API with input:', input);
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodeURIComponent(input)}`;
    this.http.get(apiUrl).subscribe((response) => {
      console.log('API response:', response);
    })
  }

  
    
  
  getPostContent(input: string): void {

    if(!this.userInputUrl){
      alert('Please enter a valid URL');
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodeURIComponent(this.userInputUrl)}`;
    const apiPostStatsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(this.userInputUrl)}`;
    this.http.get<{ POST_CONTENT: string }>(apiUrl).subscribe({
      next: (response) => {
        this.postContent = response.POST_CONTENT || 'No content available for this post'; // Extract post_content from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.postContent = 'Failed to fetch post content. Please try again.';
      }
    });
    
    this.http.get<{ total_reports: number }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        console.log('Total reports:', response.total_reports);
        this.reportTotal = response.total_reports || 0;// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.reportTotal = null;
      }
    
    });

    this.http.get<{ average_daily_reports: number }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        this.averagePostCount = (response.average_daily_reports ?? 0).toFixed(1) // Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.averagePostCount = null;
      }
    });

    this.http.get<{ peak_reports: number }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        this.peakReport = response.peak_reports || 0// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.peakReport = null;
      }
    });

    this.http.get<{threat: {threat_level: number} }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        this.threatLevel = (response.threat?.threat_level ?? 0).toFixed(1)// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.threatLevel = null;
      }
    });

  }

  
  isLightboxOpen = false;
  
  
  images = ["image1.jpg", "image2.jpg", "image3.jpg"]; 

  toggleGraph() {
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }
  

  
}
