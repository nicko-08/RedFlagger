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
    this.addUser();
  }

  goToHome(){
    this.router.navigate(["/home"]);
  }

  async addUser() {
    const { data, error } = await this.authService.supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      console.error('Unable to get access token:', error);
      return;
    }
    const accessToken = data.session.access_token;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    
    // Example POST request (fixing syntax error)
    this.http.post(
      'https://redflagger-api-10796636392.asia-southeast1.run.app/user/new',
      {}, // Add your request body here
      { headers }
    ).subscribe(
      response => console.log('User added:', response),
      err => console.error('Error adding user:', err)
    );
  }
}
