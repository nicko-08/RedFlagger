import { Component, inject, OnInit } from '@angular/core';
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
  userInputUrl: string = "";
  isPost: boolean | null = null;

  authService = inject(AuthService);
  constructor(private router: Router) {}
  sharedService = inject(SharedService);

 async ngOnInit() {
  // Check if the user is logged in when the component initializes
  const session = await this.authService.getSession();

  this.isLoggedIn = !!session; // Set isLoggedIn to true if a session exists
}

  async logoutUser() {
    await this.authService.logout();
    this.isLoggedIn = false; // Update the login status
}

  searchAction(): void{
  console.log('searching...');
  console.log('Search action triggered with input:', this.userInputUrl);
  this.determinePostType();
  this.sharedService.updateInput(this.userInputUrl);
  
  

}

determinePostType(){
  if(!this.userInputUrl){
    alert('Please enter a valid URL');
    this.router.navigate(['/home']);
    return;
  }

  if(this.userInputUrl.includes('/posts') || this.userInputUrl.includes('/permalink')){
    this.isPost = true; //link is a post
    this.router.navigate(['/information'], {queryParams: {input:this.userInputUrl}});
    console.log(this.isPost);
  }
  else if (this.userInputUrl.includes('facebook.com')){
    this.isPost = false; //link is a page
    this.router.navigate(['/page-information'], {queryParams: {input:this.userInputUrl}});
    console.log(this.isPost);
  }
  else{
    alert('Invalid Facebook URL');
    this.isPost = null;
    this.router.navigate(['/home']);
  }
}
}
