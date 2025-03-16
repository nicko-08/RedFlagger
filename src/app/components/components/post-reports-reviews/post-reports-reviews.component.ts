import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-post-reports-reviews',
  imports: [CommonModule],
  templateUrl: './post-reports-reviews.component.html',
  styleUrl: './post-reports-reviews.component.css'
})
export class PostReportsReviewsComponent {
  safePostUrl: SafeResourceUrl | null = null;
  sanitizer = inject(DomSanitizer);
  posts: any[] = [];
  postLevels: { [postId: number]: number } = {};

  constructor(  private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const input = params['input'];
      if (input) {
        this.getPageLinks(input);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/page-information'], { queryParams: { input: this.route.snapshot.queryParams['input'] } });
  }

  getPageLinks(input: string): void {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(input)}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        this.posts = response.POSTS;
        this.posts.forEach(post => {
          this.fetchPostDetails(post.POST_URL, post.POST_ID);
        });
      }
    );
  }

  fetchPostDetails(postUrl: string, postId: number): void {
    this.http.get<{ threat: { color: string; hex: string; threat_level: number } }>(`https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(postUrl)}`)
      .subscribe(
        (response) => {
          this.postLevels[postId] = response.threat?.threat_level ?? 0;
          console.log(`Details for ${postUrl}:`, response);
        },
        (error) => {
          console.error(`Error fetching details for ${postUrl}:`, error);
        }
      );
  }

  gotoInfo(postUrl: string): void {
    this.router.navigate(['/information'], { queryParams: { input: postUrl } });
}
}

