import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
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
          console.log('FB embed URL:', this.fbEmbedUrl);
        }
      });
      this.initializeChart();
  }

  callApi(input: string): void{
    console.log('Calling API with input:', input);
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/page?page_url=${encodeURIComponent(input)}`;
  }

  //Graph part
  initializeChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx2 = document.getElementById('myChart2') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Count',
            data: [], // Start with empty data
            backgroundColor: '#eb3636',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, // Always start from zero
          },
        },
        plugins: {
          legend: { position: 'top',
            labels: { color: 'black', font: { size: 15 } }
           },
          title: { display: true, text: 'Frequent Reports',
            font: { size: 25, weight: 'bold'},
            color: 'black'
           },
        },
      },
    });
    
    //second graph
    this.chart2 = new Chart(ctx2, {
      type: 'line', // Line chart for variety
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Total Reports',
            data: [], // Start with empty data
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: '#36a2eb',
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, // Always start from zero
          },
        },
        plugins: {
          legend: { position: 'top',
          labels: { color: 'black', font: {size: 15} }
           },
          title: { display: true, 
            text: 'Reports Over Time',
            font: { size: 22, weight: 'bold' },
            color: 'black'
          },
        },
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
      },
    };
  
    chart.update(); // Refresh the chart
  }

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
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.pageName = 'Failed to fetch post content. Please try again.';
      }
    });

    this.http.get<{ total_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        console.log('Total reports:', response.total_reports);
        this.reportTotal = response.total_reports || 0;// Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.reportTotal = null;
      }
    
    });

    this.http.get<{ average_daily_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.averagePostCount = (response.average_daily_reports ?? 0).toFixed(1) // Extract total reports from API response
      },
      error: (err) => {
        console.error('Error fetching post content:', err);
        this.averagePostCount = null;
      }
    });

    this.http.get<{ peak_reports: number }>(apiPageStatsUrl).subscribe({
      next: (response) => {
        this.peakReport = response.peak_reports || 0// Extract total reports from API response
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
          console.log(`Details for ${postUrl}:`, response);
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
  
}