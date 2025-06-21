import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  @Output() imageSaved = new EventEmitter<void>();

  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);

  images = ['default', 'happy', 'wizard'];
  exitNotSaved = false;
  saving = false;

  ngOnInit():void{
    this.originalImage = this.currentImage;
  }
  
  selectImage(image: string) {
    this.imageSelected.emit(image);
    this.currentImage = image; 
  }

  async saveImage(){
    if(this.currentImage == this.originalImage){
      return;
    }
    this.saving = true;
    this.originalImage = this.currentImage;
    this.exitNotSaved = false;

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      alert('Failed to retrieve access token. Please log in again.');
      this.router.navigate(['/home'])
      return;
      }
    
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/user/update/image?image=${encodeURIComponent(this.currentImage)}`;
    console.log(apiUrl);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    this.http.put(apiUrl, {}, { headers }).subscribe({
      next: (response: any) => {
        this.saving = false;
        this.imageSaved.emit();
        this.close();
      },
      error: (error: any) => {
        console.error('Error Sending Vote');
      }
    });
  }

  close() {
    if(this.currentImage != this.originalImage){
      this.exitNotSaved = true;
      return;
    }
    this.closePopup.emit();
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.authService.getSession();
    return session?.access_token || null;
  }

}
