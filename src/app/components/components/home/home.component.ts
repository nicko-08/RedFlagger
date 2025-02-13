import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);

  ngOnInit(): void{
    this.authService.listenForAuthChanges();
  }
  
}

