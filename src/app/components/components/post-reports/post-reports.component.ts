import { Component, ElementRef, inject, Input, input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService } from '../../../shared.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-post-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-reports.component.html',
  styleUrl: './post-reports.component.css'
})

export class PostReportsComponent {

  @Input() userInputUrl!: string ;
  
  isLoggedIn!: boolean;
  isModerator!: boolean;

  reports: any[] = [];
  reportImages: string[] | null = null;
  reportContent: string | null = null;
  reportTime: string | null = null;
  username: string | null = null;
  userId: string|undefined = '';



  authService = inject(AuthService);
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  sharedService = inject(SharedService);
  sanitizer = inject(DomSanitizer);
  router = inject(Router);

  async ngOnInit(): Promise<void>{
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
      this.getReports(this.userInputUrl);
    }
    console.log(this.isLoggedIn);
    console.log("cock", this.userInputUrl);
  })
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

  async deleteReviews(report_id: number, review_id:number): Promise<void>{
    if(this.userInputUrl == null){ 
      return;
    }
    const confirmDelete = confirm('Are you sure you want to delete this review?');
  
    if (!confirmDelete) {
      return; // Stop execution if user cancels
    }
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/report/${encodeURIComponent(report_id)}/review/${encodeURIComponent(review_id)}?post_url=${encodeURIComponent(this.userInputUrl)}`;

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
        console.log("Review Deleted");
        this.reports = [];
        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error Deleting Review');
      }
    });
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
              console.log("torture");
              this.getVote(report.REPORT_ID); 
              report.EDITING = false;
              report.REVIEW_ERROR = false;
              report.VIEWING_REVIEW = false;
              this.checkIfOwnPost(report.USER_ID).then(result => {
                report.OWNERSHIP = result;
                console.log(report.OWNERSHIP); // Prints: true or false
              });
              console.log(report.OWNERSHIP)
              report.REVIEW_DATA = new FormGroup(
                {
                  content: new FormControl(null),
                  rating: new FormControl(null)
                }
              )
          });
        }
      }
  
    });
  }

  getReviews(input:string, report_id:number){
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/report/${encodeURIComponent(report_id)}/reviews?post_url=${encodeURIComponent(input)}`;
    console.log(apiUrl);
    this.http.get<any[]>(apiUrl).subscribe({
      next: (response: any[]) => {
        const report = this.reports.find(r => r.REPORT_ID === report_id);
        report.REVIEWS = response;       
      }
    });
  }

  viewReviews(report_id:number){
    const report = this.reports.find(r => r.REPORT_ID === report_id);
    report.VIEWING_REVIEW = !report.VIEWING_REVIEW;
    this.getReviews(this.userInputUrl,report_id);
    console.log(report.REVIEWS);
  }

  onAddReviewFocus(report_id:number){
    const report = this.reports.find(r => r.REPORT_ID === report_id);
    console.log("Hi", report_id)
    report.EDITING = true;
  }

  onAddReviewBlur(report_id:number){
    setTimeout(()=>{
      const report = this.reports.find(r => r.REPORT_ID === report_id);
      let content = report.REVIEW_DATA.value.content;
      let rating = report.REVIEW_DATA.value.rating;
      let content_truth  = content != null;
      if(content = ''){
        content_truth = false;
      }
      let rating_truth  = rating != null;

      console.log(report_id, " ",content, content_truth, " ", rating_truth);

      if(content_truth){
        report.EDITING = true;
      }
      else if(rating_truth){
        report.EDITING = true;
      }
      else{
        report.EDITING = false;
      }
    }, 200);
  }


  async addReview(report_id:number){
    const confirmSubmit = confirm('Are you sure you want to submit this review?');
  
    if (!confirmSubmit) {
      return;
    }
    const report = this.reports.find(r => r.REPORT_ID === report_id);
    let content = report.REVIEW_DATA.value.content;
    let rating = report.REVIEW_DATA.value.rating;
    const content_truth  = content != null;
    const rating_truth  = rating != null;

    console.log(report_id, " ", content_truth, " ", rating_truth);
    if(!content){
      report.REVIEW_ERROR = true;
      return;
    }
    if(!rating){
      report.REVIEW_ERROR  = true;
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/review/new?&report_id=${encodeURIComponent(report_id)}&content=${encodeURIComponent(content)}&rating=${encodeURIComponent(rating)}`;

    console.log(apiUrl);

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      alert('Failed to retrieve access token. Please log in again.');
      this.router.navigate(['/home'])
      return;
    }
    //main function of HTTP POST
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    this.http.post(apiUrl,{}, { headers }).subscribe({
      next: (response: any) => {
        console.log('Review submitted successfully', response);
        alert('Review submitted successfully!');
        const report = this.reports.find(r => r.REPORT_ID === report_id);
        report.VIEWING_REVIEW = false;
      },
      error: (error: any) => {
        console.error('Error submitting the report:', error);
        alert('Failed to submit the report. Please try again.');
      },
    });

    report.REVIEW_ERROR  = false;
    report.REVIEW_DATA.reset()
  }

  cancelReview(report_id:number){
    const confirmCancel = confirm('Are you sure you want to cancel?');
  
    if (!confirmCancel) {
      return;
    }
    const report = this.reports.find(r => r.REPORT_ID === report_id);
    let content = report.REVIEW_DATA.value.content;
    let rating = report.REVIEW_DATA.value.rating;
    console.log(report_id, " ", content, " ", rating);
    report.REVIEW_ERROR  = false;
    report.REVIEW_DATA.reset()
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



  goBack(){
    this.router.navigate(['/information'], { queryParams: { input: this.userInputUrl } });
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

  async checkIfOwnPost(report_user_id:string){
    let session =  null;
    let attempts = 0;
    const maxAttempts = 10;
    while (!session && attempts < maxAttempts) {
      session = await this.authService.getSession();
      
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        attempts++;
      }
    }
    console.log("hello", session);
    if(!session){
      console.log("hello 1", session);
      return false;
    }
    console.log("Session ID", session.user.id);
    console.log("Report User Id", report_user_id);
    if(session.user.id === report_user_id){
      console.log("hello")
      return true;
    }else{
      console.log("bye")
      return false;
    }
  }
  
}
