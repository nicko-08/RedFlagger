import { inject, Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
    constructor() {
    Chart.register(...registerables);
  }
  http = inject(HttpClient);

  private chart!: Chart;
  private chart2!: Chart;


  initializeChartsAndFetchData(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, userInputUrl: string): void {
    this.chart = new Chart(canvas1, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Count',
            data: [],
            backgroundColor: '#eb3636',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Frequent Reports',
            font: { size: 25, weight: 'bold' },
            color: '#777777'
          }
        }
      }
    });

    this.chart2 = new Chart(canvas2, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Total Reports',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: '#36a2eb',
            borderWidth: 1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Reports Over Time',
            font: { size: 25, weight: 'bold' },
            color: '#777777'
          }
        }
      }
    });

    this.fetchAndUpdateCharts(userInputUrl);
  }

  private fetchAndUpdateCharts(userInputUrl: string): void {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(userInputUrl)}`;

    this.http.get<{
      frequency_over_time: { date: string; count: number }[];
      total_reports_over_time: { date: string; total_reports: number }[];
    }>(apiUrl).subscribe({
      next: (response) => {
        const freq = response.frequency_over_time.map(item => ({ date: item.date, value: item.count }));
        const totals = response.total_reports_over_time.map(item => ({ date: item.date, value: item.total_reports }));

        if (freq.length > 0) this.updateChart(this.chart, freq);
        if (totals.length > 0) this.updateChart(this.chart2, totals);
      },
      error: (err) => {
        console.error('Chart data fetch error:', err);
      }
    });
  }

  private updateChart(chart: Chart, dataArray: { date: string; value: number }[]): void {
    const labels = dataArray.map(item => item.date);
    const data = dataArray.map(item => item.value);
    const max = Math.max(...data);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;

    chart.options.scales = {
      y: {
        beginAtZero: true,
        max: max + 1
      }
    };

    chart.update();
  }
}

