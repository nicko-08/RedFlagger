import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.supabaseURL, environment.supabaseKey);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  userStatus = signal<any>(null);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  currentUser = signal<{email: string, username: string} | null > (null) ;
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


}
