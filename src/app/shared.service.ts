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

  private postPattern = new RegExp(
    /^https?:\/\/(www\.)?facebook\.com\/([^/]+)\/(posts)\/([a-zA-Z0-9]+)/i
  );

  private pagePattern = new RegExp(
    /^https?:\/\/(www\.)?facebook\.com\/([^/?&]+)(\/)?$/i
  );

  determinePostType(userInputUrl: string): void {
    if (!userInputUrl) {
      alert('Please enter a valid URL');
      this.router.navigate(['/home']);
      return;
    }

    if(this.postPattern.test(userInputUrl)){
      this.router.navigate(['/information'], { queryParams: { input: userInputUrl } });
    }else if(this.pagePattern.test(userInputUrl)){
      this.router.navigate(['/page-information'], { queryParams: { input: userInputUrl } });
    }else{
      alert('Invalid Facebook URL');
      this.router.navigate(['/home']); 
    }
  }

  private getFacebookPostId(url: string): { postId: string; pageId: string; type: string } {
    const match = this.postPattern.exec(url);
    if (match) {
      return {
        postId: match[4],
        pageId: match[2],
        type: match[3]
      };
    }
    throw new Error('Invalid post URL');
  }

  private getFacebookPageId(url: string): string {
    const match = this.pagePattern.exec(url);
    if (match) {
      return match[2];
    }
    throw new Error('Invalid page URL');
  }

}
