import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../shared.service';


@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userInputUrl: string | null = "";
  accReportCount: number | null = 0;
  postReportCount: number | null = 0;
  userReportCount: number | null = 0;
  sharedServe = inject(SharedService);

  apiUrl: string = "https://redflagger-api-10796636392.asia-southeast1.run.app/stats";
  http = inject(HttpClient);

  ngOnInit(): void{
    this.http.get<{'Accounts Reported': number; 'Posts Reported': number; 'User Reports': number}>(this.apiUrl).subscribe({
      next: (response) =>{
        this.accReportCount = response['Accounts Reported'];
        this.postReportCount = response['Posts Reported'];
        this.userReportCount = response['User Reports'];
      }
    })
  }

  searchAction(): void{
    this.sharedServe.determinePostType(this.userInputUrl!);
  }
}

