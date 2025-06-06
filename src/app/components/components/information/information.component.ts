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
import { ChartService } from '../../../chart.service';
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
@ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
@ViewChild('chartCanvas2', { static: false }) chartCanvas2!: ElementRef<HTMLCanvasElement>;

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
chartServe = inject(ChartService);



ngOnInit():void{
      this.isLoading = true;

      let session; 
      this.authService.getSession().then(
        (new_session)=>{
          this.userId = new_session?.user.id;
          session = new_session;
          this.isLoggedIn = !!session;
        }
      );
      this.checkRole();
      this.route.queryParams.subscribe((params) => {
        this.userInputUrl = params['input'];
        if(this.userInputUrl){
          this.getPostContent(this.userInputUrl);
          
          this.getReports(this.userInputUrl);
          const fbPageUrl = 'https://www.facebook.com/plugins/post.php?href=';
          this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${encodeURIComponent(this.userInputUrl)}&width=100%`);

        }
      });
      
  }

  
  getLinkAndRouteReport():void{
    const key = "age";

    let alreadyreported:boolean = false;


    if(this.userId){
      this.reports.forEach(element => {


        if(this.userId === element.USER_ID){
          alreadyreported = true;
        }
      });
    }



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

    this.router.navigate(['/post-reports'], {queryParams: {input: this.userInputUrl}});
  }
  

  getPostContent(input: string): void {
    this.isLoading = true;
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
        

        //Ito yung original method mo, nilagyan ko lang ng animate count para dun sa method pang animate ng numbers//

        /* 
        this.reportTotal = response.total_reports || 0;// Extract total reports from API response
        this.averagePostCount = response.average_daily_reports.toFixed(1) || '0'; // Extract average daily reports from API response
        this.peakReport = response.peak_reports || 0; // Extract peak reports from API response
        */
       
        //Ito yung method na pang animate ng numbers//
        this.animateCount(response.total_reports || 0, 'reportTotal');
        this.animateCount(Math.floor(response.average_daily_reports || 0), 'averagePostCount');
        this.animateCount(response.peak_reports || 0, 'peakReport');
        
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
    if(this.userInputUrl){
      this.chartServe.initializeChartsAndFetchData(
      this.chartCanvas.nativeElement,
      this.chartCanvas2.nativeElement,
      this.userInputUrl
    );
    } 
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }

  //Graph part
  
  

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

        return new Promise((resolve) => {
            this.http.get<{ type: string, vote_count:number }>(apiUrl, { headers }).subscribe(
                (response) => {
                  const report = this.reports.find(r => r.REPORT_ID === report_id);

                  if(report){
                    report.vote_type = response.type;

                    report.vote_count = response.vote_count;
                  }
                },
                (error) => {
                
                }
            );
        });
    });
  
  }


  @ViewChild('stats') stats!: ElementRef;

  scrollToStats(){
    this.stats.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  //Method pang animate ng numbers//

  animateCount(target: number, property: keyof InformationComponent, duration: number = 1500) {
  const start = 0;
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * target);
    (this as any)[property] = currentValue;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      (this as any)[property] = target; // Ensure final value is exact
    }
  };

  requestAnimationFrame(step);
}

}
