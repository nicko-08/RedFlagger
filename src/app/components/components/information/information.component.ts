import { Component, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageInformationComponent } from "../page-information/page-information.component";
import { SharedService } from '../../../shared.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth.service';
import { Chart, ChartConfiguration, registerables  } from 'chart.js';
import { flush } from '@angular/core/testing';
@Component({
  selector: 'app-information',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {
Number(arg0: string|null) {
throw new Error('Method not implemented.');
}
isLoggedIn = false;
isModerator = true;
isLoading = true;
userInputUrl: string | null = null;
pageLink: string | null = null;
postContent: string | null = "Loading...";
reportTotal: number | null = 0;
fbEmbedUrl: SafeResourceUrl | null = null;
averagePostCount: string | null = "0";
threatLevel: number | null = 0; //this is needed to be a string to display the threat level decimal in the UI
peakReport: number | null = 0;
threatColor: string | null = "Loading...";
threatHex: string | null = null;
userId: string|undefined = '';

//reports of the post part
reports: any[] = [];
reportImages: string[] | null = null;
reportContent: string | null = null;
reportTime: string | null = null;
username: string | null = null;

//chart
@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
@ViewChild('chartCanvas2') chartCanvas2!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;
  chart2!: Chart;
  
constructor() {
  // Register all required components for Chart.js
  Chart.register(...registerables);
}


authService = inject(AuthService);
http = inject(HttpClient);
route = inject(ActivatedRoute);
sharedService = inject(SharedService);
sanitizer = inject(DomSanitizer);
router = inject(Router);



async ngOnInit(): Promise<void> {
      console.log("hello");
      let session; await this.authService.getSession().then(
        (new_session)=>{
          this.userId = new_session?.user.id;
          session = new_session;
          console.log(this.userId);
        }
      );
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
      this.initializeChart();
  }

  callApi(input: string): void {
    console.log('Calling API with input:', input);
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodeURIComponent(input)}`;
    this.http.get(apiUrl).subscribe((response) => {
      console.log('API response:', response);
    })

  }

  
  getLinkAndRouteReport():void{
    const key = "age";

    let alreadyreported:boolean = false;
    console.log(this.reports);

    if(this.userId){
      this.reports.forEach(element => {
        console.log(element);    
        console.log(element.USER_ID);
        if(this.userId === element.USER_ID){
          alreadyreported = true;
        }
      });
    }

    console.log(alreadyreported)

    if(alreadyreported){
      alert("You've already reported this Post, to prevent spam we only allow one report per post per account");
      return;
    }


    if(!this.isLoggedIn){
      this.router.navigate(['/sign-in']);  
      return;
    }
    this.router.navigate(['/report'], { queryParams: { link: this.userInputUrl } });
  }

  goToReports():void{
    console.log("hello");
    this.router.navigate(['/post-reports'], {queryParams: {input: this.userInputUrl}});
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.postContent = 'Failed to fetch post content. Please try again.';
        this.isLoading = false;
      }
    });
    
    this.http.get<{ total_reports: number, average_daily_reports: number, peak_reports: number,  }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        console.log('Total reports:', response.total_reports);
        this.reportTotal = response.total_reports || 0;// Extract total reports from API response
        this.averagePostCount = response.average_daily_reports.toFixed(1) || '0'; // Extract average daily reports from API response
        this.peakReport = response.peak_reports || 0; // Extract peak reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.reportTotal = null;
        this.averagePostCount = null;
        this.peakReport = null;
      }
    
    });

    

    this.http.get<{threat: {color: string; hex: string; threat_level: number} }>(apiPostStatsUrl).subscribe({
      next: (response) => {
        this.threatColor = response.threat?.color ?? 'Unknown';
        this.threatHex = response.threat?.hex ?? '#000000';
        this.threatLevel = (response.threat?.threat_level ?? 0)// Extract total reports from API response
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
    const ctx2 = document.getElementById('myChart2') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Count',
            data: [], // Start with empty data
            backgroundColor: '#eb3636',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, // Always start from zero
          },
        },
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Frequent Reports',
            font: { size: 25, weight: 'bold'},
            color: 'black'
           },
        },
      },
    });
    
    //second graph
    this.chart2 = new Chart(ctx2, {
      type: 'line', // Line chart for variety
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Total Reports',
            data: [], // Start with empty data
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: '#36a2eb',
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, // Always start from zero
          },
        },
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Reports Over Time',
            font: { size: 25, weight: 'bold'},
            color: 'black'
           },
        },
      },
    });
  }

  // Fetch data from the API and update the chart
  fetchData(input: string) {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(input)}`;
    this.http.get<{ frequency_over_time: { date: string; count: number }[] 
    total_reports_over_time: { date: string; total_reports: number }[]}>(apiUrl).subscribe(
      (response) => {
        const frequencyData = response.frequency_over_time;
        const totalReportsData = response.total_reports_over_time;
  
        if (frequencyData.length > 0) {
          // Update the first chart with frequency data
          this.updateChart(
            this.chart, 
            frequencyData.map((item) => ({ date: item.date, value: item.count }))
          );
        }
  
        if (totalReportsData.length > 0) {
          // Update the second chart with total reports data
          this.updateChart(
            this.chart2, 
            totalReportsData.map((item) => ({ date: item.date, value: item.total_reports }))
          );
        }
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
  

  // Update chart with new data 
  updateChart(chart: Chart, dataArray: { date: string; value: number }[]) {
    const labels = dataArray.map((item) => item.date);
    const data = dataArray.map((item) => item.value);
  
    const maxDataValue = Math.max(...data); // Get the max value from data
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
  
    // Dynamically set the max value for the y-axis
    chart.options.scales = {
      y: {
        beginAtZero: true, // Set min to 0
        max: maxDataValue + 1, // Set max to maxDataValue + 1
      },
    };
  
    chart.update(); // Refresh the chart
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
          this.reports.forEach(report => {
            this.getVote(report.REPORT_ID);
            report.editing = false;
        });
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
  async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }
  getVote(report_id: number): void{
    if (!this.isLoggedIn) {
        return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/check_vote?report_id=${encodeURIComponent(report_id)}`;

    this.getAccessToken().then((accessToken) => {
        if (!accessToken) {
            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`,
        });
        console.log("balls")
        return new Promise((resolve) => {
            this.http.get<{ type: string, vote_count:number }>(apiUrl, { headers }).subscribe(
                (response) => {
                  const report = this.reports.find(r => r.REPORT_ID === report_id);
                  console.log("gagoy")
                  if(report){
                    report.vote_type = response.type;
                    console.log("vote_type:", response.type);
                    report.vote_count = response.vote_count;
                  }
                },
                (error) => {
                
                }
            );
        });
    });
  
  }
async putVote(report_id:number, vote_type:string){
  if(this.userInputUrl == null){ 
    return;
  }
  let trunc_vote = '';
  if(vote_type === 'upvote'){
    trunc_vote = 'up';
  }else if(vote_type === 'downvote'){
    trunc_vote = 'down';
  }
  const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/report/vote?report_id=${encodeURIComponent(report_id)}&vote_type=${encodeURIComponent(trunc_vote)}`;

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      alert('Failed to retrieve access token. Please log in again.');
      this.router.navigate(['/home'])
      return;
    }


    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    console.log(apiUrl);
    this.http.put(apiUrl,{}, {headers}).subscribe({
      next: (response: any) => {
        console.log("Vote Sent");
        const report = this.reports.find(r => r.REPORT_ID === report_id);
        if(report){
          console.log("hello");
        }
        else{
          console.log("no");
        }
        if(report.vote_type === vote_type){
          report.vote_type = "none";
          if(vote_type === "upvote"){
            report.vote_count -=1;
          } else if (vote_type === "downvote"){
            report.vote_count += 1;
          }
        }else{
          if(report.vote_type === "upvote"){
            report.vote_count -= 1;
          }else if(report.vote_type === "downvote"){
            report.vote_count += 1;
          }

          report.vote_type = vote_type;
          if(vote_type === "upvote"){
            report.vote_count += 1;
          }else if (vote_type === "downvote"){
            report.vote_count -= 1;
          }
        }
      },
      error: (error: any) => {
        console.error('Error Sending Vote');
      }
    });
  }

  @ViewChild('stats') stats!: ElementRef;

  scrollToStats(){
    this.stats.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}






