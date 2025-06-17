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
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';


@Component({
  selector: 'app-information',
  standalone: true, 
  imports: [CommonModule, RouterModule, LottieComponent], 
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
chartReady = false;
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

  texts = [
    'Loading Data',
    'Finding Post', 
    'Scrolling the Database', 
    'Checking if Developers Alive',
    'Blaming Backend',
    'Trying not to Vibe Code'
  ];
  currentText = this.texts[0];
  index = 0;
  fadeOut = false;
  intervalId: any;


  ngOnInit(): void {
    this.isLoading = true;

    this.intervalId = setInterval(() => {
      this.fadeOut = true;
      setTimeout(() => {
        this.index = (this.index + 1) % this.texts.length;
        this.currentText = this.texts[this.index];
        this.fadeOut = false;
      }, 500); 
    }, 2000);

    let session;
    this.authService.getSession().then(
      (new_session) => {
        this.userId = new_session?.user.id;
        session = new_session;
        this.isLoggedIn = !!session;
      }
    );
    this.checkRole();
    this.route.queryParams.subscribe((params) => {
      this.userInputUrl = params['input'];
      if (this.userInputUrl) {
        this.getPostContent(this.userInputUrl);

        this.getReports(this.userInputUrl);
        const fbPageUrl = 'https://www.facebook.com/plugins/post.php?href=';
        this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${encodeURIComponent(this.userInputUrl)}&width=100%`);

        this.chartReady = true;
      }
    });
  }

  ngAfterViewInit(): void {
  // Wait for both userInputUrl and ViewChild to be ready
  const tryInitChart = () => {
    if (this.chartReady && this.chartCanvas && this.chartCanvas2) {
      this.toggleGraph();
    } else {
      setTimeout(tryInitChart, 100); // keep checking until ready
    }
  };

  tryInitChart();
}

  ngOnDestroy() {
    clearInterval(this.intervalId);
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
  

  /*
  getPostContent(input: string): void {
    this.isLoading = true;
    if(!this.userInputUrl){
      alert('Please enter a valid URL');
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodeURIComponent(this.userInputUrl)}`;
    this.http.get<{ POST_CONTENT: string, POST_URL: string}>(apiUrl).subscribe({
      next: (response) => {
        this.postContent = response.POST_CONTENT || 'No content available for this post'; // Extract post_content from API response
        this.isLoading = false;
        this.userInputUrl = response.POST_URL;
        const apiPostStatsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(response.POST_URL)}`;
        this.http.get<{ total_reports: number, average_daily_reports: number, peak_reports: number, }>(apiPostStatsUrl).subscribe({
          next: (response) => {


            console.log(response);
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
        this.http.get<{ threat: { color: string; hex: string; threat_level: number } }>(apiPostStatsUrl).subscribe({
          next: (response) => {
            this.threatColor = response.threat?.color ?? 'Unknown';
            this.threatHex = response.threat?.hex ?? '#000000';
            this.threatLevel = (response.threat?.threat_level ?? 0);

            this.animateGauge();
          },
          error: (err) => {
            console.error('Error fetching post content:', err);
            this.threatLevel = null;
            this.threatColor = null;
            this.threatHex = null;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.postContent = 'Failed to fetch post content. Please try again.';
        this.isLoading = false;
      }
    });
  }
*/
/////NEW METHOD MEDYO BUMILIS NG SLIGHT
  getPostContent(input: string): void {
    this.isLoading = true;

    if (!this.userInputUrl) {
      alert('Please enter a valid URL');
      this.isLoading = false;
      return;
    }

    const encodedUrl = encodeURIComponent(this.userInputUrl);
    const contentUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post?post_url=${encodedUrl}`;
    const statsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodedUrl}`;

    // Fetch post content
    this.http.get<{ POST_CONTENT: string, POST_URL: string }>(contentUrl).subscribe({
      next: (contentResponse) => {
        this.postContent = contentResponse.POST_CONTENT || 'No content available for this post';
        this.userInputUrl = contentResponse.POST_URL;

        // Fetch stats and threat info in parallel
        this.http.get<{ 
          total_reports: number, 
          average_daily_reports: number, 
          peak_reports: number, 
          threat: { color: string, hex: string, threat_level: number } 
        }>(statsUrl).subscribe({
          next: (statsResponse) => {
            const total = statsResponse.total_reports ?? 0;
            const average = statsResponse.average_daily_reports ?? 0;
            const peak = statsResponse.peak_reports ?? 0;
            const threat = statsResponse.threat;

            // Animate numeric values
            this.animateCount(total, 'reportTotal');
            this.animateCount(Math.floor(average), 'averagePostCount');
            this.animateCount(peak, 'peakReport');

            // Set threat visuals
            this.threatColor = threat?.color ?? 'Unknown';
            this.threatHex = threat?.hex ?? '#000000';
            this.threatLevel = threat?.threat_level ?? 0; // this is the target
            this.animateGauge();
            this.isLoading = false;
          },
          error: (statsErr) => {
            console.error('Error fetching post stats:', statsErr);
            this.reportTotal = null;
            this.averagePostCount = null;
            this.peakReport = null;
            this.threatLevel = null;
            this.threatColor = null;
            this.threatHex = null;
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.postContent = 'Failed to fetch post content. Please try again.';
        this.isLoading = false;
      }
    });
  }

  toggleGraph() {
    if(this.userInputUrl){
      this.chartServe.initializeChartsAndFetchData(
      this.chartCanvas.nativeElement,
      this.chartCanvas2.nativeElement,
      this.userInputUrl
    );
    } 
  }

  //Graph part//
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

  //para sa progress bar ng theat level//
  semiCircumference = Math.PI * 80; // 
  animatedThreatLevel = 0;
  circumference = 2 * Math.PI * 45; //

  get dashOffset(): number {
    // Clamp threatLevel between 0 and 10
    const level = Math.max(0, Math.min(10, this.threatLevel ?? 0));
    return this.circumference * (1 - level / 10);
  }

  ngOnChanges() {
    this.animateGauge();
  }

animateGauge() {
  const start = this.animatedThreatLevel ?? 0;
  const end = Math.max(0, Math.min(10, this.threatLevel ?? 0));
  const duration = 30;
  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = this.easeOutCubic(progress);

    this.animatedThreatLevel = start + (end - start) * eased;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      this.animatedThreatLevel = end;
    }
  };

  requestAnimationFrame(animate);
}


easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}


  get semiDashOffset(): number {
    const level = Math.max(0, Math.min(10, this.animatedThreatLevel));
    return this.semiCircumference * (1 - level / 10);
  }

  private animationItem:AnimationItem | undefined;

  options: AnimationOptions = {
    path: 'animations/loading.json',
    loop: true,
  };

  animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
  }
}
