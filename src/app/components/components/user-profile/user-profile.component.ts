import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared.service';
import { Subscription } from 'rxjs';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [NgIf, NgClass, FormsModule] 
})
export class UserProfileComponent implements OnInit, OnDestroy {
  username: string = '';
  showUsernameForm = true;
  currentUsername = ''; 
  newUsername = '';
  confirmPassword1 = '';
  confirmPassword2 = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  private authSub?: Subscription;

  

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.authService.logout();
  }

  saveChanges() { 

    /* implement */ 
  }
}