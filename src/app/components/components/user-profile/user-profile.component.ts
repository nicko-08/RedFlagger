import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [] 
})
export class UserProfileComponent {
  username: string | null = null;
  userId: string | null = null;

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    const user = this.authService.supabase.auth.getUser();
    user.then(({ data }) => {
      if (data?.user) {
        this.username = data.user.user_metadata['username'] || null;
        this.userId = data.user.id;
      }
    });

    

  }
  goToSettings(){
    this.router.navigate(['/profile-settings']);
    }
}