import { Component, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService } from '../../../shared.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth.service';


@Component({
  selector: 'app-post-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-reports.component.html',
  styleUrl: './post-reports.component.css'
})

export class PostReportsComponent {

  userInputUrl: string | null = null;
  isLoggedIn = false;
  isModerator = true;

  reports: any[] = [];
  reportImages: string[] | null = null;
  reportContent: string | null = null;
  reportTime: string | null = null;
  username: string | null = null;



  authService = inject(AuthService);
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  sharedService = inject(SharedService);
  sanitizer = inject(DomSanitizer);
  router = inject(Router);


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
}
