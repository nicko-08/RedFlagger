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
    /^https?:\/\/(web\.|m\.|mbasic\.)?(www\.)?facebook\.com\/([^/]+)\/(posts)\/([a-zA-Z0-9]+)|^https?:\/\/(web\.|m\.|mbasic\.)?(www\.)?facebook\.com\/permalink\.php\?.*?story_fbid=([a-zA-Z0-9]+)&id=([0-9]+)/i
  );
  

  private pagePattern = new RegExp(
    /^https?:\/\/(web\.|m\.|mbasic\.)?(www\.)?facebook\.com\/([^/?&]+)\/?$|^https?:\/\/(web\.|m\.|mbasic\.)?(www\.)?facebook\.com\/profile\.php\?id=([0-9]+)/i
  );
  
  determinePostType(userInputUrl: string): void {
    if (!userInputUrl) {
      alert('Please enter a valid URL');
      this.router.navigate(['/home']);
      return;
    }

    if(this.postPattern.test(userInputUrl)){
      console.log(this.getCleanLink(userInputUrl));
      let clean_link = this.getCleanLink(userInputUrl);
      console.log(clean_link);
      this.router.navigate(['/information'], { queryParams: { input: clean_link } });
    }else if(this.pagePattern.test(userInputUrl)){
      console.log(this.getCleanLink(userInputUrl));
      let clean_link = this.getCleanLink(userInputUrl);
      this.router.navigate(['/page-information'], { queryParams: { input: clean_link } });
    }else{
      alert('Invalid Facebook URL');
      this.router.navigate(['/home']); 
    }
  }

  private getCleanLink(userInputUrl: string): string | null {
    if (this.postPattern.test(userInputUrl)) {
        let post = this.getFacebookPostId(userInputUrl);
        console.log("Extracted Post Data:", post); 
        if (!post.pageId || !post.postId) {
            console.error("Missing postId or pageId");
            return null;
        }
        return `https://facebook.com/${post.pageId}/posts/${post.postId}`;
    } 
    
    if (this.pagePattern.test(userInputUrl)) {
        let page = this.getFacebookPageId(userInputUrl);
        return `https://facebook.com/${page}`;
    }
    
    return null;
}
  

private getFacebookPostId(url: string): { postId: string; pageId: string; type: string } {
  const match = this.postPattern.exec(url);
  console.log("Regex Match Result:", match); 

  if (match) {
    if (match[5]) {
      return {
        postId: match[5],  
        pageId: match[3],  
        type: 'post'
      };
    }

    if (match[8] && match[9]) {
      return {
        postId: match[8],  
        pageId: match[9],  
        type: 'post'
      };
    }
  }

  throw new Error('Invalid post URL');
}

private getFacebookPageId(url: string): string {
  console.log("Input URL:", url);
  const pageMatch = this.pagePattern.exec(url);
  console.log("Regex Match Result (Page):", pageMatch);

  if (pageMatch) {
    if (pageMatch[3]) {
      return pageMatch[3]; 
    }

    if (pageMatch[6]) {
      return pageMatch[6]; 
    }
  }

  throw new Error('Invalid page URL');
}

}

