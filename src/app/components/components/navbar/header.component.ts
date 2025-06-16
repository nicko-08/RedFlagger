import { Component, inject, OnInit,ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared.service';
@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  
  isLoggedIn = false;
  isMenuOpen: boolean = false; 
  isDropdownOpen = false;
  userInputUrl: string = "";
  username: string = "";
  
  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef; 

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; 
  }

    toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

    closeDropdown() {
    this.isDropdownOpen = false;
  }

  authService = inject(AuthService);
  sharedService = inject(SharedService);

 async ngOnInit() {
  // Check if the user is logged in when the component initializes
 
  const session = await this.authService.getSession();
  
  this.isLoggedIn = !!session; // Set isLoggedIaccessTokenn to true if a session exists


  if(this.isLoggedIn){
    this.username = session?.user.user_metadata['username'];
  }
  
 }
  async logoutUser() {
    this.authService.logout();
      this.isLoggedIn = false; // Update the login status
      //refresh the page for the changes to take effect 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
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

    // Check if dropdown is open and click was outside the dropdown trigger
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
      if (!this.isDropdownOpen || !this.dropdownTrigger) return;

  if (!this.dropdownTrigger.nativeElement.contains(event.target)) {
    this.isDropdownOpen = false;
  }
}
}
