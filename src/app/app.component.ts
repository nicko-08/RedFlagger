import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { HeaderComponent } from "./components/components/navbar/header.component";
import { FooterComponent } from "./components/components/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { EmailConfirmedComponent } from "./components/components/email-confirmed/email-confirmed.component";
import { CheckEmailComponent } from './components/components/check-email/check-email.component';
import {ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import gsap from 'gsap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit{

  isDarkMode = false;

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

    });
        const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    }
  }

   toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
    
  }

  
  private enableDarkMode(): void {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    this.isDarkMode = true;
  }

  private disableDarkMode(): void {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    this.isDarkMode = false;
  }

  @ViewChild('pageContainer', { static: true }) pageContainer!: ElementRef;
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      // Skip animation if homepage
      if (url === '/' || url === '/home') {
        // Optionally ensure page is visible immediately on homepage
        gsap.set(this.pageContainer.nativeElement, { opacity: 1, y: 0 });
        return;
      }

      // Otherwise, animate normally
      gsap.fromTo(
        this.pageContainer.nativeElement,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }
      );
    });
    }

}
