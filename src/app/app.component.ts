import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { HeaderComponent } from "./components/components/navbar/header.component";
import { FooterComponent } from "./components/components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { EmailConfirmedComponent } from "./components/components/email-confirmed/email-confirmed.component";
import { CheckEmailComponent } from './components/components/check-email/check-email.component';

@Component({
  selector: 'app-root',
  imports: [SignUpComponent, HeaderComponent, FooterComponent, RouterOutlet, EmailConfirmedComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Redflagger';
  authService = inject(AuthService)
  ngOnInit(): void{
    this.authService.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.authService.currentUser.set({
          email: session?.user.email!,
          username: session?.user.identities?.at(0)?.identity_data?.['username'],
        })
      }else if (event === 'SIGNED_OUT') {
        this.authService.currentUser.set(null);
      }
      console.log('!!', event, session);
    });
  }

  
}
