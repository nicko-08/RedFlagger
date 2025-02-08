import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
 authService = inject(AuthService);
isLoggedIn = false;
 async ngOnInit() {
  // Check if the user is logged in when the component initializes
  const session = await this.authService.getSession();
  

  this.isLoggedIn = !!session; // Set isLoggedIn to true if a session exists
}

  async logoutUser() {
    await this.authService.logout();
    this.isLoggedIn = false; // Update the login status
}
}
