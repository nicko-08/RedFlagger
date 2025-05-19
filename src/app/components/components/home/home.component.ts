import { Component, inject, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../shared.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CommonModule } from '@angular/common';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  imports: [FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  userInputUrl: string | null = "";
  accReportCount: number | null = 0;
  postReportCount: number | null = 0;
  userReportCount: number | null = 0;
  sharedServe = inject(SharedService);

  actualPostCount: number = 0;
  actualUserCount: number = 0;
  actualAccCount: number = 0;

  apiUrl: string = "https://redflagger-api-10796636392.asia-southeast1.run.app/stats";
  http = inject(HttpClient);

  ngOnInit(): void{
    this.http.get<{'Accounts Reported': number; 'Posts Reported': number; 'User Reports': number}>(this.apiUrl).subscribe({
      next: (response) =>{
        this.animateCount('accReportCount', response['Accounts Reported']);
        this.animateCount('postReportCount', response['Posts Reported']);
        this.animateCount('userReportCount', response['User Reports']);
      }
    })


  }



  searchAction(): void{
    this.sharedServe.determinePostType(this.userInputUrl!);
    this.sharedServe.updateInput(this.userInputUrl!);
  }

  //Method pang animate sa stats tsaka GSAP animation//
  animateCount(property: keyof this, target: number, duration = 3000) {
    const start = 0;
    const range = target - start;
    const steps = 100; 
    let currentStep = 0;

    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easeInOutCubic(progress);
      const currentValue = start + range * easedProgress;

      (this as any)[property] = Math.floor(currentValue);

      if (currentStep >= steps) {
        (this as any)[property] = target;
        clearInterval(interval);
      }
    }, duration / steps);
  }

  ngAfterViewInit(): void {
    gsap.from('.heading1', {
      duration: 1.5,
      y: -50,
      delay: 0.3,
      opacity: 0,
      ease: 'power4.out',
    });

    gsap.from('.heading2', {
      duration: 1.5,
      y: 50,
      opacity: 0,
      delay: 0.8,
      ease: 'power4.out',
    });

    gsap.from('.linkbox', {
      duration: 2,
      scale: 0.8,
      opacity: 0,
      delay: 0.2,
      ease: 'back.in(1.7)',
    });

    gsap.from('.stats-container', {
      scrollTrigger: {
      trigger: '.stats-container',
      start: 'top 100%', 
      toggleActions: 'play none none none', 
      },
      scale: 1.3,
      opacity: 0,
      duration: 1.5,
      delay: 0.2,
      ease: 'back.out(1.4)',
    });

    //Option sa animation pili na lang tayo//
    /* 
    const boxes = document.querySelectorAll('.stats-container .box');
    boxes.forEach((box, i) => {
    let animProps = {};

      if (i === 0) {
        // First box from left
        animProps = { x: -100, opacity: -10 };
      } else if (i === 1) {
        // Second box from below
        animProps = { y: 90, opacity: -10 };
      } else if (i === 2) {
        // Third box from right
        animProps = { x: 90, opacity: 0 };
      }

    gsap.from(box, {
      scrollTrigger: {
      trigger: box,
      start: 'top 90%',
      toggleActions: 'play none none none',
      },
      duration: 1,
      ease: 'power3.out',
      delay: i * 0.1,
      ...animProps,
      });
    });
    */

    gsap.to('.vid-container', {
      scale: 1.4,
      filter: 'blur(3px)',
      duration: 1,
      scrollTrigger: {
      trigger: '.vid-container',
      start: 'top',
      end: 'bottom',
      scrub: true
      }
    });
  }

  

}

