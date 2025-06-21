import { inject, Injectable } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
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

  initializeChartsAndFetchData(
    canvas1: HTMLCanvasElement,
    canvas2: HTMLCanvasElement,
    userInputUrl: string
  ): void {
    this.chart = this.createModernLineChart(
      canvas1,
      'Frequent Reports',
      'Count',
      'rgb(249, 115, 22)'
    );

    this.chart2 = this.createModernLineChart(
      canvas2,
      'Reports Over Time',
      'Total Reports',
      'rgb(59, 130, 246)' 
    );

    this.fetchAndUpdateCharts(userInputUrl);
  }

  /// CREATE LINE CHART ///
  private createModernLineChart(
    canvas: HTMLCanvasElement,
    title: string,
    label: string,
    color: string
  ): Chart {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label,
            data: [],
            borderColor: color,
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
              gradient.addColorStop(0, `${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}`);
              gradient.addColorStop(1, `${color.replace('rgb', 'rgba').replace(')', ', 0)')}`);
              return gradient;
            },
            tension: 0.4, 
            fill: true,
            borderWidth: 3,

            pointRadius: 0,
            pointHoverRadius: 0,
            pointBorderWidth: 0,
            pointBackgroundColor: 'transparent'
          }
        ]
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
            text: title,
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
      }
    };

    return new Chart(canvas, config);
  }

  private fetchAndUpdateCharts(userInputUrl: string): void {
    const apiUrl = `https://redflagger-api-10796636392.asia-southeast1.run.app/post/stats?post_url=${encodeURIComponent(userInputUrl)}`;

    this.http.get<{
      frequency_over_time: { date: string; count: number }[];
      total_reports_over_time: { date: string; total_reports: number }[];
    }>(apiUrl).subscribe({
      next: (response) => {
        const freq = response.frequency_over_time.map(item => ({
          date: item.date,
          value: item.count
        }));

        const totals = response.total_reports_over_time.map(item => ({
          date: item.date,
          value: item.total_reports
        }));

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
      ...chart.options.scales,
      ['y']: {
        ...chart.options.scales?.['y'],
        beginAtZero: true,
        max: max + 1,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#64748b'
        }
      }
    };

    chart.update();
  }
}
