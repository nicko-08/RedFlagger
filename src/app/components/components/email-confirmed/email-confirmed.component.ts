import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-confirmed',
  imports: [],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.css'
})
export class EmailConfirmedComponent {

  router = inject(Router);

  authService = inject(AuthService);

  ngOnInit(): void{
    this.authService.listenForAuthChanges();
  }

  goToHome(){
    this.router.navigate(["/home"]);
  }
}
