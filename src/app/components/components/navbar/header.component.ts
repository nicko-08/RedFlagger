import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared.service';
import {HostListener } from '@angular/core';

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
  sharedService = inject(SharedService);

 async ngOnInit() {
  // Check if the user is logged in when the component initializes
 
  const session = await this.authService.getSession();
  
  this.isLoggedIn = !!session; // Set isLoggedIn to true if a session exists


  if(this.isLoggedIn){
    this.username = session?.user.user_metadata['username'];
  }
  
 }
  async logoutUser() {
    this.authService.logout();
      this.isLoggedIn = false; // Update the login status
  }

  

  searchAction(): void{
  this.sharedService.determinePostType(this.userInputUrl);
  this.sharedService.updateInput(this.userInputUrl);
  }



  @HostListener('window:resize', ['$event'])
  toggleMenuOnResize(event: Event) {
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.toggleMenu();
    }
  }



}
