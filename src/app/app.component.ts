import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { HeaderComponent } from "./components/components/header/header.component";
import { FooterComponent } from "./components/components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [SignUpComponent, HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Redflagger';
  authService = inject(AuthService)
  ngOnInit(): void{
    this.authService.supabase.auth.onAuthStateChange((event, session) => {
      console.log('!!', event, session);
    });
  }
}
