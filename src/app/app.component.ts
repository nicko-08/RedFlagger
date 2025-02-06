import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { HeaderComponent } from "./components/components/header/header.component";
import { FooterComponent } from "./components/components/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [SignUpComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Redflagger';
}
