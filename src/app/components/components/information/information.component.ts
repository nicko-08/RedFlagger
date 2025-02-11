import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-information',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent {
  isLightboxOpen = false;

  images = ["image1.jpg", "image2.jpg", "image3.jpg"]; 

  toggleGraph() {
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }
}
