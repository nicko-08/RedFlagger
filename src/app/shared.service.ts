import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  router = inject(Router);
  private inputSource = new BehaviorSubject<string | null>(null);
  currentInput$ = this.inputSource.asObservable();

  updateInput(input: string): void {
    this.inputSource.next(input);
  }

  determinePostType(userInputUrl: string): void {
    if (!userInputUrl) {
      alert('Please enter a valid URL');
      this.router.navigate(['/home']);
      return;
    }

    if (userInputUrl.includes('/posts')) {
      this.router.navigate(['/information'], { queryParams: { input: userInputUrl } }); // goes to post info
    } else if (userInputUrl.includes('facebook.com')) {
      this.router.navigate(['/page-information'], { queryParams: { input: userInputUrl } }); // goes to page info
    } else {
      alert('Invalid Facebook URL');
      this.router.navigate(['/home']); // redirect back to home if invalid URL
    }
  }
}
