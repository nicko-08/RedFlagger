import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.supabaseURL, environment.supabaseKey);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  userStatus = signal<any>(null);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  currentUser = signal<{email: string, username: string} | null > (null) ;

  constructor(private http: HttpClient){

  }
  
  register(email: string, username: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signUp({
      email,
      password,
      options:{
        data: {
          username,
        },
      },
    });
    return from(promise)
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return from(promise);
  }
  
  logout() {
    this.supabase.auth.signOut();
    this.userStatus.set(null);
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return data.session;
  }

listenForAuthChanges(): void{
  this.supabase.auth.onAuthStateChange(async(event, session)=>{
    if(event === 'SIGNED_IN' && session?.user?.email_confirmed_at){
      const accessToken = session.access_token;
      let stringe = "Bearer " + accessToken;
      const baseHeaders = new HttpHeaders().set('Authorization', stringe);

      console.log(baseHeaders.get('Authorization'))
      
      this.http.post<{message : string}>('https://redflagger-api.et.r.appspot.com/user/new',{},{headers: baseHeaders}).subscribe({
        next: (response: {message: string})=>{
          console.log('User inserted Successfully:', response);
        },
        error: (error: any) =>{
          console.error('Error inserting user:', error);
        },
      });
    }
  });
}
}


