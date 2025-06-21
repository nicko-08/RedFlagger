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
        // Check session on service init
    this.getSession().then(session => {
      this.isLoggedInSubject.next(!!session);
    });
    this.listenForAuthChanges();
  }
  
  register(email: string, username: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signUp({
      email,
      password,
      options:{
        data: {
          username,
        },
        emailRedirectTo: 'https://redflagger.site/email-confirmed',
      },
    });
    return from(promise)
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    }).then(response => {
      if (response.data.session) {
        this.isLoggedInSubject.next(true);
      }
      return response;
    });
    return from(promise);
  }
  
  logout() {
    this.supabase.auth.signOut();
    this.userStatus.set(null);
    this.isLoggedInSubject.next(false);
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return data.session;
  }

listenForAuthChanges(): void {
  this.supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
      this.isLoggedInSubject.next(true);

    }

    if (event === 'SIGNED_OUT') {
      this.isLoggedInSubject.next(false);
    }
  });
}

getPageData(urlLink: String): Observable<any>{
  return this.http.get('https://redflagger-api.et.r.appspot.com/page?pageurl='+urlLink);
}

updatePassword(new_Password: string): Observable<any> {
  return from(this.supabase.auth.updateUser({ password: new_Password }))
  }
  
}