import { Component, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageInformationComponent } from "../page-information/page-information.component";
import { SharedService } from '../../../shared.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth.service';
import { Chart, ChartConfiguration, registerables  } from 'chart.js';
@Component({
  selector: 'app-information',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {
isLoggedIn = false;
isModerator = true;
userInputUrl: string | null = null;
postContent: string | null = null;
reportTotal: number | null = null;
fbEmbedUrl: SafeResourceUrl | null = null;
averagePostCount: string | null = null;
threatLevel: string | null = null; //this is needed to be a string to display the threat level decimal in the UI
peakReport: number | null = null;
threatColor: string | null = null;
threatHex: string | null = null;

//reports of the post part
reports: any[] = [];
reportImages: string[] | null = null;
reportContent: string | null = null;
reportTime: string | null = null;
username: string | null = null;


//chart
@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
constructor() {
  // Register all required components for Chart.js
  Chart.register(...registerables);
}
lastUpdateDate: string | null = null; // Track the most recent date

authService = inject(AuthService);
http = inject(HttpClient);
route = inject(ActivatedRoute);
sharedService = inject(SharedService);
sanitizer = inject(DomSanitizer);
router = inject(Router);

  ngOnInit(): void {
      const session =  this.authService.getSession();
      this.isLoggedIn = !!session;
      this.checkRole();
      this.route.queryParams.subscribe((params) => {
        this.userInputUrl = params['input'];
        if(this.userInputUrl){
          this.callApi(this.userInputUrl);
          this.getPostContent(this.userInputUrl);
          this.fetchData(this.userInputUrl);
          this.getReports(this.userInputUrl);
          const fbPageUrl = 'https://www.facebook.com/plugins/post.php?href=';
          this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${encodeURIComponent(this.userInputUrl)}&width=100%`);
          console.log('FB embed URL:', this.fbEmbedUrl);
        }
      });
  }

  callApi(input: string): void {
    console.log('Calling API with input:', input);
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodeURIComponent(input)}`;
    this.http.get(apiUrl).subscribe((response) => {
      console.log('API response:', response);
    })

    this.initializeChart();
  }

  
  getLinkAndRouteReport():void{
    this.router.navigate(['/report'], { queryParams: { link: this.userInputUrl } });
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

    this.http.get<{threat: {color: string; hex: string; threat_level: number} }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        this.threatColor = response.threat?.color ?? 'Unknown';
        this.threatHex = response.threat?.hex ?? '#000000';
        this.threatLevel = (response.threat?.threat_level ?? 0).toFixed(1)// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.threatLevel = null;
        this.threatColor = null;
        this.threatHex = null;
      }
    });

  }

  
  isLightboxOpen = false;
  
  images = ["image1.jpg", "image2.jpg", "image3.jpg"]; 

  toggleGraph() {
    this.isLightboxOpen = true;
      if(!this.userInputUrl){
        alert('Please enter a valid URL');
        return;
      }
    this.initializeChart();
    this.fetchData(this.userInputUrl);
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }

  //Graph part
  initializeChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Total Reports',
            data: [], // Start with empty data
            backgroundColor: '#eb3636',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Reports Over Time' },
        },
      },
    });
    
  }

  // Fetch data from the API and update the chart
  fetchData(input: string) {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(input)}`;
    this.http.get<{ frequency_over_time: { date: string; count: number }[] }>(apiUrl).subscribe(
      (response) => {
        const allData = response.frequency_over_time;
  
        if (allData.length > 0) {
          // Update the chart with all-time data
          this.updateChart(allData);
        }
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
  

  // Update chart with new data while maintaining a max of 10 bars
  updateChart(dataArray: { date: string; count: number }[]) {
    const labels = dataArray.map((item) => item.date);
    const data = dataArray.map((item) => item.count);
  
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
  
    this.chart.update(); // Refresh the chart
  }
getReports(input: string): void {
  const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/reports?post_url=${encodeURIComponent(input)}`;
  this.http.get<any[]>(apiUrl).subscribe({
    next: (response: any[]) => {
      this.reports = response;
      // If you want to extract details from the first report, for example:
        if (this.reports.length) {
          const { IMAGES, REPORT_CONTENT, REPORT_TIME, USERNAME } = this.reports[0];
          this.reportImages = IMAGES && IMAGES.length ? IMAGES : ['No images available'];
          this.reportContent = REPORT_CONTENT || 'No content available';
          this.reportTime = REPORT_TIME || 'No time available';
          this.username = USERNAME || 'No username available';
        }
      }

    });
  } 
  
  private checkRole(): void {
    if (!this.isLoggedIn) {
        this.isModerator = false;
        return;
    }

    const apiUrl = 'https://redflagger-api-10796636392.asia-southeast1.run.app/check_role';

    this.getAccessToken().then((accessToken) => {
        if (!accessToken) {
            this.isModerator = false;
            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`,
        });

        this.http.get<{ role: string }>(apiUrl, { headers }).subscribe(
            (response) => {
                this.isModerator = response.role === 'moderator';
                console.log('User is moderator:', this.isModerator);
            },
            (error) => {
                console.error('Error checking role:', error);
                this.isModerator = false;
            }
        );
    });
  }
async deleteReport(report_id: number): Promise<void>{

  if(this.userInputUrl == null){ 
    return;
  }
  const confirmDelete = confirm('Are you sure you want to delete this report?');

  if (!confirmDelete) {
    return; // Stop execution if user cancels
  }
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/report/${encodeURIComponent(report_id)}?post_url=${encodeURIComponent(this.userInputUrl)}`;

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      alert('Failed to retrieve access token. Please log in again.');
      this.router.navigate(['/home'])
      return;
    }


    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    this.http.delete(apiUrl, {headers}).subscribe({
      next: (response: any) => {
        console.log("Report Deleted");
        this.reports = [];
        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error Deleting Report');
      }
    });
  }
  private async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }
}
