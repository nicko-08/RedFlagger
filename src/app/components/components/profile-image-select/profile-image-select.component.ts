import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-profile-image-select',
  standalone: true,
  imports: [],
  templateUrl: './profile-image-select.component.html',
  styleUrl: './profile-image-select.component.css'
})
export class ProfileImageSelectComponent {

  @Input() currentImage:string = 'default';
  originalImage:string = 'default';
  @Output() closePopup = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<string>();


  images = ['default', 'happy', 'wizard'];
  exitNotSaved = false;

  ngOnInit():void{
    this.originalImage = this.currentImage;
  }
  
  selectImage(image: string) {
    this.imageSelected.emit(image);
    this.currentImage = image; 
  }

  saveImage(){
    if(this.currentImage == this.originalImage){
      return;
    }
    this.originalImage = this.currentImage;
    this.exitNotSaved = false;
    
    this.imageSelected.emit();
    this.close();
  }

  close() {
    if(this.currentImage != this.originalImage){
      this.exitNotSaved = true;
      return;
    }
    this.closePopup.emit();
  }


}
