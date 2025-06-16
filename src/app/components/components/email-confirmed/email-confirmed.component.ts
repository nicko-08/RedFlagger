import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-email-confirmed',
  imports: [],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.css'
})
export class EmailConfirmedComponent {

  router = inject(Router);

  authService = inject(AuthService);
  constructor(private http: HttpClient){
    }

  ngOnInit(): void{
    this.authService.listenForAuthChanges();
    const accessToken = sessionStorage.getItem('access_token');
          let stringe = "Bearer " + accessToken;
          const baseHeaders = new HttpHeaders().set('Authorization', stringe);
    
          this.http.post<{ message: string }>(
            'https://redflagger-api-10796636392.asia-southeast1.run.app/user/new',
            {},
            { headers: baseHeaders }
          ).subscribe({
            next: (response: { message: string }) => {console.log('User inserted successfully:', response.message);},
            error: (error: any) => {
              console.error('Error inserting user:', error);
            },
          });
  }

  goToHome(){
    this.router.navigate(["/home"]);
  }
}
