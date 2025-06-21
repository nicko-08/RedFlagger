import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { ChartService } from '../../../chart.service';
@Component({
  selector: 'app-page-information',
  imports: [CommonModule],
  templateUrl: './page-information.component.html',
  styleUrl: './page-information.component.css'
})
export class PageInformationComponent implements OnInit{
  
pageName: string | null = null;
userInputUrl: string | null = null;
fbEmbedUrl: SafeResourceUrl | null = null;
reportTotal: number | null = null;
peakReport: number | null = null;
averagePostCount: string | null = null;
threatLevel: string | null = null;
threatColor: string | null = null;
threatHex: string | null = null;
posts: any[] = [];
postLevels: { [postId: number]: number } = {};
safePostUrl: SafeResourceUrl  | null = null;

router = inject(Router);
sanitizer = inject(DomSanitizer);
//chart
@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
@ViewChild('chartCanvas2') chartCanvas2!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;
  chart2!: Chart;
  
  constructor(
  ) {
    // Register all required components for Chart.js
    Chart.register(...registerables);
  }


http = inject(HttpClient);
route = inject(ActivatedRoute);
chartServe = inject(ChartService);


  ngOnInit(): void {
      this.route.queryParams.subscribe((params) => {
        this.userInputUrl = params['input'];
        if(this.userInputUrl){
          this.callApi(this.userInputUrl);
          this.getPageContent(this.userInputUrl);
          this.fetchData(this.userInputUrl);
          this.getPageLinks(this.userInputUrl);
        }
      });
      this.route.queryParams.subscribe((params)=>{
        const input = params['input'];
        if(input){
          const fbPageUrl = 'https://www.facebook.com/plugins/page.php';
          const queryParams = `?href=${encodeURIComponent(input)}&tabs=timeline&width=500&height=100&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=608367321950607`
          this.fbEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${fbPageUrl}${queryParams}`);

        }
      });
      this.initializeChart();
  }

  callApi(input: string): void{

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(input)}`;
  }

  //Graph part
  initializeChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx2 = document.getElementById('myChart2') as HTMLCanvasElement;

    // First chart (Frequent Reports)
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Count',
            data: [], // Start with empty data
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
              gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
              gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
              return gradient;
            },
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 0,
            pointBorderWidth: 0,
            pointBackgroundColor: 'transparent'
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: { 
            display: true, 
            text: 'Frequent Reports',
            font: { 
              size: 20, 
              weight: 'bold',
              family: 'Inter, sans-serif'
            },
            color: '#777777'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            padding: 10,
            cornerRadius: 6
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      },
    });
    
    // Second chart (Reports Over Time)
    this.chart2 = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Total Reports',
            data: [], // Start with empty data
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
              return gradient;
            },
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 0,
            pointBorderWidth: 0,
            pointBackgroundColor: 'transparent'
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: { 
            display: true, 
            text: 'Reports Over Time',
            font: { 
              size: 20, 
              weight: 'bold',
              family: 'Inter, sans-serif'
            },
            color: '#777777'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            padding: 10,
            cornerRadius: 6
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      },
    });
  }

  // Fetch data from the API and update the chart
  fetchData(input: string) {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page/stats?page_url=${encodeURIComponent(input)}`;
    this.http.get<{ frequency_over_time: { date: string; count: number }[] 
    total_reports_over_time: { date: string; total_reports: number }[]}>(apiUrl).subscribe(
      (response) => {
        const frequencyData = response.frequency_over_time;
        const totalReportsData = response.total_reports_over_time;
  
        if (frequencyData.length > 0) {
          // Update the first chart with frequency data
          this.updateChart(
            this.chart, 
            frequencyData.map((item) => ({ date: item.date, value: item.count }))
          );
        }
  
        if (totalReportsData.length > 0) {
          // Update the second chart with total reports data
          this.updateChart(
            this.chart2, 
            totalReportsData.map((item) => ({ date: item.date, value: item.total_reports }))
          );
        }
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
  

  // Update chart with new data 
  updateChart(chart: Chart, dataArray: { date: string; value: number }[]) {
    const labels = dataArray.map((item) => item.date);
    const data = dataArray.map((item) => item.value);
  
    const maxDataValue = Math.max(...data); // Get the max value from data
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
  
    // Dynamically set the max value for the y-axis
    chart.options.scales = {
      y: {
        beginAtZero: true, // Set min to 0
        max: maxDataValue + 1, // Set max to maxDataValue + 1
        grid: { display: false },
        border: { display: false },
               ticks: {
        color: '#64748b'
        }
      },
      x: {
      ...(chart.options.scales as any)?.x,
        grid: { display: false },
        border: { display: false },
        ticks: {
        color: '#64748b',
        font: { size: 12 }
      }
    }
  };
  
    chart.update(); // Refresh the chart
  }


  /////ORIGINAL CODE, MEDYO MABAGAL NG KAUNTI//////
  /*
  getPageContent(input: string): void {

    if(!this.userInputUrl){
      alert('Please enter a valid URL');
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(this.userInputUrl)}`;
    const apiPageStatsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page/stats?page_url=${encodeURIComponent(this.userInputUrl)}`;
    this.http.get<{ PAGE_NAME: string }>(apiUrl).subscribe({
      next: (response) => {
        this.pageName = response.PAGE_NAME || 'No content available for this post'; // Extract post_content from API response
        if (this.pageName === 'No content available for this post') {
          alert('No content available for this post');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.pageName = 'Failed to fetch post content. Please try again.';
      }
      
    });

    this.http.get<{ total_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        //original code mo//
        // this.reportTotal = response.total_reports || 0; Extract total reports from API response
        this.animateCount('reportTotal', response.total_reports || 0);
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.reportTotal = null;
      }
    
    });

    this.http.get<{ average_daily_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        //original code mo//
        //this.averagePostCount = (response.average_daily_reports ?? 0).toFixed(1) // Extract total reports from API response
        this.animateDecimal('averagePostCount', response.average_daily_reports ?? 0);
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.averagePostCount = null;
      }
    });

    this.http.get<{ peak_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        //original code mo//
        //this.peakReport = response.peak_reports || 0 // Extract total reports from API response
        this.animateCount('peakReport', response.peak_reports || 0);
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.peakReport = null;
      }
    });

    this.http.get<{threat: {color: string; hex: string; threat_level: number} }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.threatColor = response.threat?.color ?? 'Unknown';
        this.threatHex = response.threat?.hex ?? '#000000';
        this.threatLevel = (response.threat?.threat_level ?? 0).toFixed(1)// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.threatLevel = null;
        this.threatColor = null;
        this.threatHex = null;
      }
    });
  }
  */

    ///NEW METHOD, SLIGHTLY BUMILIS DI KO LANG SIGURADO///// 
    getPageContent(input: string): void {
    if (!this.userInputUrl) {
      alert('Please enter a valid URL');
      return;
    }

    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(this.userInputUrl)}`;
    const apiPageStatsUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page/stats?page_url=${encodeURIComponent(this.userInputUrl)}`;

    // First request: Get page name
    this.http.get<{ PAGE_NAME: string }>(apiUrl).subscribe({
      next: (response) => {
        this.pageName = response.PAGE_NAME || 'No content available for this post';
        if (this.pageName === 'No content available for this post') {
          alert('No content available for this post');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.pageName = 'Failed to fetch post content. Please try again.';
      }
    });

    // Second request: Get all stats in one call
    this.http.get<{
      total_reports: number,
      average_daily_reports: number,
      peak_reports: number,
      threat: {
        color: string,
        hex: string,
        threat_level: number
      }
    }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.animateCount('reportTotal', response.total_reports || 0);
        this.animateDecimal('averagePostCount', response.average_daily_reports ?? 0);
        this.animateCount('peakReport', response.peak_reports || 0);

        this.threatColor = response.threat?.color ?? 'Unknown';
        this.threatHex = response.threat?.hex ?? '#000000';
        this.threatLevel = (response.threat?.threat_level ?? 0).toFixed(1);
      },
      error: (err) => {
        console.error('Error fetching page stats:', err);
        this.reportTotal = null;
        this.averagePostCount = null;
        this.peakReport = null;
        this.threatLevel = null;
        this.threatColor = null;
        this.threatHex = null;
      }
    });
  }
  
  getPageLinks(input: string): void{
    if(!this.userInputUrl){
      return;
    }
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(this.userInputUrl)}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) =>{
        this.posts = response.POSTS;
        this.posts.forEach(post =>{
          this.fetchPostDetails(post.POST_URL, post.POST_ID);
        })
      }
    )
  }
  fetchPostDetails(postUrl: string, postId: number): void {
    this.http.get<{threat: {color: string; hex: string; threat_level: number} }>(`https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(postUrl)}`)
      .subscribe(
        (response) => {
          this.postLevels[postId] = response.threat?.threat_level ?? 0;

        },
        (error) => {
          console.error(`Error fetching details for ${postUrl}:`, error);
        }
      );
  }
  gotoInfo(postUrl: string): void {
      this.router.navigate(['/information'], { queryParams: { input: postUrl } });
  }

  ///route to post-reports-reviews///
  navigateToPostReportReviews(): void {
    
    this.router.navigate(['/post-report-reviews'], { queryParams: { input: this.userInputUrl } });
  }
  

  //Method pang Animate ng Numbers sa Stats//
  animateCount(property: keyof this, target: number, duration = 1500, steps = 100) {
    const start = 0;
    const range = target - start;
    let currentStep = 0;

    const easeOutQuad = (t: number) => t * (2 - t); // smoother than linear

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = easeOutQuad(progress);
      const currentValue = start + range * eased;

      (this as any)[property] = Math.floor(currentValue);

      if (currentStep >= steps) {
        (this as any)[property] = target;
        clearInterval(interval);
      }
    }, duration / steps);
  }


  animateDecimal(property: keyof this, target: number, duration = 1500, steps = 60) {
    let currentStep = 0;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const start = 0;
    const range = target;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = easeOutCubic(progress);
      const value = start + range * eased;

      (this as any)[property] = value.toFixed(1);

      if (currentStep >= steps) {
        (this as any)[property] = target.toFixed(1);
        clearInterval(interval);
      }
    }, duration / steps);
  }

    animateAllStatsTogether(stats: {
    total: number,
    peak: number,
    average: number
  }, duration = 1500, steps = 60) {
    let currentStep = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = easeOutCubic(progress);

      // Update all stats in sync
      this.reportTotal = Math.floor(stats.total * eased);
      this.peakReport = Math.floor(stats.peak * eased);
      this.averagePostCount = (stats.average * eased).toFixed(1);

      if (currentStep >= steps) {
        this.reportTotal = stats.total;
        this.peakReport = stats.peak;
        this.averagePostCount = stats.average.toFixed(1);
        clearInterval(interval);
      }
    }, duration / steps);
  }

}