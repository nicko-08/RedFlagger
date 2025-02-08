import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.supabaseURL, environment.supabaseKey);
  
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
  
}
