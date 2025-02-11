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
  isExpanded = false; 
  expandedImage: string | null = null; 

  images = ["image1.jpg", "image2.jpg", "image3.jpg"]; 

  toggleGraph() {
    this.isExpanded = !this.isExpanded;
  }

  toggleImage(img: string) {
    this.expandedImage = this.expandedImage === img ? null : img;
  }
}
