import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { HeaderComponent } from "./components/components/navbar/header.component";
import { FooterComponent } from "./components/components/footer/footer.component";
import { HomeComponent } from "./components/components/home/home.component";

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, HomeComponent, SignUpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Redflagger';
}
