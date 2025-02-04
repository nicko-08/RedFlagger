import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignUpComponentComponent } from "./components/components/sign-up-component.component";

@Component({
  selector: 'app-root',
  imports: [SignUpComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Redflagger';
}
