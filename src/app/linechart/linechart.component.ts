import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-linechart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linechart.component.html',
  styleUrl: './linechart.component.css'
})
export class LinechartComponent {
  private data: any[] = [];
  private svg: any;
  private margin = { top: 20, right: 30, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  public years: number[] = [];
  private colors: any;
  private tooltip: any;

  constructor(private el: ElementRef) {}

  // ngOnInit(): void {
  //   this.loadData();
  // }

  // private async loadData() {
  //   const rawData = await d3.csv('assets/timelines/merged_temperatures_no_anomalies.csv', d3.autoType);
    
  //   // Parse data to group by year
  //   this.data = rawData.map((d: any) => ({
  //     year: Math.floor(d.Date / 100),
  //     month: d.Date % 100,
  //     avg: d.Avg_Temperature,
  //     min: d.Min_Temperature,
  //     max: d.Max_Temperature,
  //   }));
  //   this.years = Array.from(new Set(this.data.map(d => d.year))).sort();
  //   this.colors = d3.scaleOrdinal(d3.schemeCategory10).domain(this.years.map(String));
  //   this.createChart();
  //   this.updateChart(this.years[0]);
  // }

  // private createChart() {
  //   const container = d3.select(this.el.nativeElement).select('.chart-container');
  //   container.selectAll('*').remove();

  //   this.svg = container
  //     .append('svg')
  //     .attr('width', this.width + this.margin.left + this.margin.right)
  //     .attr('height', this.height + this.margin.top + this.margin.bottom)
  //     .append('g')
  //     .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

  //   // Add axes
  //   this.svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${this.height})`);
  //   this.svg.append('g').attr('class', 'y-axis');
  // }

  // private updateChart(year: number) {
  //   const yearData = this.data.filter(d => d.year === year);

  //   // Set scales
  //   const x = d3.scaleLinear().domain([1, 12]).range([0, this.width]);
  //   const y = d3
  //     .scaleLinear()
  //     .domain([
  //       d3.min(yearData, d => d.min) || 0,
  //       d3.max(yearData, d => d.max) || 100,
  //     ])
  //     .nice()
  //     .range([this.height, 0]);

  //   // Axes
  //   const xAxis = d3.axisBottom(x).ticks(12).tickFormat((d: d3.NumberValue) => d3.timeFormat('%B')(new Date(0, Number(d) - 1)));
  //   const yAxis = d3.axisLeft(y);

  //   this.svg.select('.x-axis').transition().call(xAxis);
  //   this.svg.select('.y-axis').transition().call(yAxis);

  //   // Define line generators
  //   const line = (key: string) =>
  //     d3
  //       .line<any>()
  //       .x(d => x(d.month))
  //       .y(d => y(d[key]));

  //   // Draw lines
  //   this.svg
  //     .selectAll('.line')
  //     .data(['min', 'max'])
  //     .join('path')
  //     .attr('class', 'line')
  //     .attr('fill', 'none')
  //     .attr('stroke', (d: string) => (d === 'min' ? this.colors(year) : d3.color(this.colors(year))?.brighter(1.5)))
  //     .attr('stroke-width', 2)
  //     .attr('d', (key: string) => line(key)(yearData));

  //   // Scatter plot for mean
  //   this.svg
  //     .selectAll('.dot')
  //     .data(yearData)
  //     .join('circle')
  //     .attr('class', 'dot')
  //     .attr('cx', (d: { month: d3.NumberValue; }) => x(d.month))
  //     .attr('cy', (d: { avg: d3.NumberValue; }) => y(d.avg))
  //     .attr('r', 4)
  //     .attr('fill', this.colors(year));
  // }

  // onYearChange(event: any) {
  //   const selectedYear = +event.target.value;
  //   this.updateChart(selectedYear);
  // }
  ngOnInit(): void {
    this.loadData();
    this.setChartDimensions();
    window.addEventListener('resize', () => this.onResize());
  }

  private async loadData() {
    const rawData = await d3.csv('assets/timelines/merged_temperatures_no_anomalies.csv', d3.autoType);
    
    this.data = rawData.map((d: any) => ({
      year: Math.floor(d.Date / 100),
      month: d.Date % 100,
      avg: d.Avg_Temperature,
      min: d.Min_Temperature,
      max: d.Max_Temperature,
    }));
    this.years = Array.from(new Set(this.data.map(d => d.year))).sort();
    this.colors = d3.scaleOrdinal(d3.schemeCategory10).domain(this.years.map(String));
    this.createChart();
    this.updateChart(this.years[0]);
  }

  private setChartDimensions() {
    const container = this.el.nativeElement.querySelector('.chart-container');
    this.width = container.clientWidth - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
  }

  private createChart() {
    const container = d3.select(this.el.nativeElement).select('.chart-container');
    container.selectAll('*').remove();

    this.svg = container
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Add axes
    this.svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${this.height})`);
    this.svg.append('g').attr('class', 'y-axis');

    // Add tooltip
    this.tooltip = d3
      .select(this.el.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('padding', '5px')
      .style('pointer-events', 'none');
  }

  private updateChart(year: number) {
    const yearData = this.data.filter(d => d.year === year);

    const x = d3.scaleLinear().domain([1, 12]).range([0, this.width]);
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(yearData, d => d.min) || 0,
        d3.max(yearData, d => d.max) || 100,
      ])
      .nice()
      .range([this.height, 0]);

    const xAxis = d3.axisBottom(x).ticks(12).tickFormat((d: d3.NumberValue) => d3.timeFormat('%B')(new Date(0, Number(d) - 1)));
    const yAxis = d3.axisLeft(y);

    this.svg.select('.x-axis').transition().call(xAxis);
    this.svg.select('.y-axis').transition().call(yAxis);

    const line = (key: string) =>
      d3
        .line<any>()
        .x(d => x(d.month))
        .y(d => y(d[key]));

    this.svg
      .selectAll('.line')
      .data(['min', 'max'])
      .join('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', (d: string) => (d === 'min' ? this.colors(year) : d3.color(this.colors(year))?.brighter(1.5)))
      .attr('stroke-width', 2)
      .attr('d', (key: string) => line(key)(yearData));

    this.svg
      .selectAll('.dot')
      .data(yearData)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d: { month: d3.NumberValue; }) => x(d.month))
      .attr('cy', (d: { avg: d3.NumberValue; }) => y(d.avg))
      .attr('r', 4)
      .attr('fill', this.colors(year))
      .on('mouseover', (event: { pageX: number; pageY: number; }, d: { month: number; min: any; max: any; avg: any; }) => {
        this.tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d3.timeFormat('%B')(new Date(0, d.month - 1))}</strong><br>
            Min: ${d.min}°C<br>
            Max: ${d.max}°C<br>
            Mean: ${d.avg}°C`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
      });
  }

  private onResize() {
    this.setChartDimensions();
    this.createChart();
    this.updateChart(this.years[0]);
  }

  onYearChange(event: any) {
    const selectedYear = +event.target.value;
    this.updateChart(selectedYear);
  }
}
