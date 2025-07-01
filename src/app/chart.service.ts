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
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = this.createModernLineChart(
      canvas1,
      'Frequent Reports',
      'Count',
      'rgb(249, 115, 22)'
    );
    if (this.chart2) {
      this.chart2.destroy();
    }
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
        spanGaps: true, 
        scales: {
          x: {
            grid: {
              color: '#e5e7eb',
              drawBorder: false,
              lineWidth: 1,
              ...( { borderDash: [4, 4] } as any )
            },
            border: {
              display: false
            },
            ticks: {   
              color: '#64748b',
              autoSkip: true, 
              maxTicksLimit: 38, 
              maxRotation: 30,   
              minRotation: 30,
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              },
              callback: function(value, index, ticks) {
                const label = this.getLabelForValue(value as number);
                const date = new Date(label);
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
              }
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
        let freq = response.frequency_over_time.map(item => ({
          date: item.date,
          value: item.count
        }));

        let totals = response.total_reports_over_time.map(item => ({
          date: item.date,
          value: item.total_reports
        }));

        freq = this.aggregate(freq);
        totals = this.aggregate(totals);

        if (freq.length > 0) this.updateChart(this.chart, freq);
        if (totals.length > 0) this.updateChart(this.chart2, totals);
      },
      error: (err) => {
        console.error('Chart data fetch error:', err);
      }
    });
  }


  private updateChart(chart: Chart, dataArray: { date: string; value: number }[]): void {
    let labels = dataArray.map(item => item.date);
    let data = dataArray.map(item => item.value);

    if (data.length === 1) {
      labels = [labels[0], labels[0]];
      data = [data[0], data[0]];
    }

    const max = Math.max(...data);
    const min = Math.min(...data);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;

    chart.options.scales = {
      ...chart.options.scales,
      ['y']: {
        ...chart.options.scales?.['y'],
        beginAtZero: true,
        min: 0, 
        max: max + 1,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#64748b'
        }
      }
    };
    console.log("labels",labels)
    console.log("data",data)
    chart.update();
  }

  private aggregate(data: {date: string, value: number}[]): {date: string, value: number}[] {
    if (data.length === 0) return [];

    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const buckets = new Map<string, number>();
    const baseDate = new Date(data[0].date);
    baseDate.setHours(0, 0, 0, 0); 

    data.forEach(({ date, value }) => {
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      const bucketIndex = Math.floor(diffDays / 2);

      const bucketStartDate = new Date(baseDate);
      bucketStartDate.setDate(baseDate.getDate() + bucketIndex * 2);
      const bucketKey = bucketStartDate.toISOString().slice(0, 10);

      buckets.set(bucketKey, Math.max(value, buckets.get(bucketKey) || 0));
    });

    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }

  public updateChart1(dataArray: { date: string; count: number }[]){
    let freq = dataArray.map (item => ({
          date: item.date,
          value: item.count
        }));
  this.updateChart(this.chart, freq)

  }

  public updateChart2(dataArray: { date: string; total_reports: number }[]){
    let totals = dataArray.map (item => ({
          date: item.date,
          value: item.total_reports
        }));
    this.updateChart(this.chart2, totals)
  }
}


