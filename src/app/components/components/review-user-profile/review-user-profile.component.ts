import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-review-user-profile',
  imports: [DatePipe, CommonModule],
  templateUrl: './review-user-profile.component.html',
  styleUrl: './review-user-profile.component.css'
})
export class ReviewUserProfileComponent {
  @Input() userId!: string;

  reviews: any[] = []; // <-- Define the property here
  loading = true; // <-- Add a loading state if needed
  http = inject(HttpClient);

  ngOnInit(){
      this.http
        .get<any>(`https://redflagger-api-10796636392.asia-southeast1.run.app/userProfile?user_id=${this.userId}`)
        .subscribe({
          next: (data) => {
            this.reviews = data.reviews; // <-- Assign the reviews data
            this.loading = false; // <-- Set loading to false after data is fetched
          },
          error: (err) => {
            console.error('Failed to fetch reviews:', err);
            this.loading = false; // <-- Set loading to false on error
          }
        });
    }

    
}

