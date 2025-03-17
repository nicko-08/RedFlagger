import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared.service';
import {HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  
  isLoggedIn = false;
  userInputUrl: string = "";
  isMenuOpen: boolean = false; 
  username: string = "";
  
  

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; 
  }

  authService = inject(AuthService);
  constructor(private router: Router) {}
  sharedService = inject(SharedService);

 async ngOnInit() {
  // Check if the user is logged in when the component initializes
 
  const session = await this.authService.getSession();
  
  this.isLoggedIn = !!session; // Set isLoggedIn to true if a session exists


  if(this.isLoggedIn){
    this.username = session?.user.user_metadata['username'];
    console.log('User is logged in');
  }
  
 }
  async logoutUser() {
    this.logout().then(() => {
      this.isLoggedIn = false; // Update the login status
    setTimeout(() => {
      window.location.reload(); 
  }, 500) // Reload the page to reflect the updated login status
    });
    
  }

  async logout(): Promise<void>{
    await this.authService.supabase.auth.signOut();
  }
  searchAction(): void{
  console.log('searching...');
  console.log('Search action triggered with input:', this.userInputUrl);
  this.sharedService.determinePostType(this.userInputUrl);
  this.sharedService.updateInput(this.userInputUrl);
  }

determinePostType(){
  if(!this.userInputUrl){
    alert('Please enter a valid URL');
    this.router.navigate(['/home']);
    return;
  }

  if(this.userInputUrl.includes('/posts') || this.userInputUrl.includes('/permalink')){
    
    this.router.navigate(['/information'], {queryParams: {input:this.userInputUrl}}); //goes to post info
    
  }
  else if (this.userInputUrl.includes('facebook.com')){
    
    this.router.navigate(['/page-information'], {queryParams: {input:this.userInputUrl}}); //goes to page info
    
  }
  else{
    alert('Invalid Facebook URL');

    this.router.navigate(['/home']); //redirect back to home if invalid url
  }
}

  @HostListener('window:resize', ['$event'])
  toggleMenuOnResize(event: Event) {
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.toggleMenu();
    }
  }



}
