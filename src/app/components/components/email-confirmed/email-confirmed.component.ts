import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-email-confirmed',
  imports: [],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.css'
})
export class EmailConfirmedComponent {
  authService = inject(AuthService);

  ngOnInit(): void{
    this.authService.listenForAuthChanges();
  }
}
