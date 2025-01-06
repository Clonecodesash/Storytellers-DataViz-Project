import { Component, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-ridgeline',
  standalone: true,
  imports: [],
  templateUrl: './ridgeline.component.html',
  styleUrl: './ridgeline.component.css'
})
export class RidgelineComponent {
  private data: any[] = [];
  private svg: any;
  private margin = { top: 50, right: 50, bottom: 50, left: 100 };
  private width!: number;
  private height!: number;
  private tooltip: any;
  private colors: any;
  private bandwidth = 5; // KDE bandwidth

  constructor(private el: ElementRef) {}

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
        min: d.Min_Temperature,
        max: d.Max_Temperature,
    }));

    console.log("Processed Data:", this.data);

    const allYears = Array.from(new Set(this.data.map(d => d.year))).sort((a, b) => b - a);
    const years = allYears.slice(0, 5);

    console.log("Years Selected:", years);

    this.data = this.data.filter(d => years.includes(d.year));
    if (this.data.length === 0) {
        console.error("Filtered data is empty. Check the dataset or filter logic.");
        return;
    }

    this.colors = d3.scaleOrdinal(d3.schemeCategory10).domain(years);
    this.createChart();
    this.updateChart(years);
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

    this.tooltip = d3
      .select(this.el.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none');
  }

  private kdeEstimator(kernel: any, thresholds: number[], data: number[]) {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))!]);
  }

  private kernelEpanechnikov(k: number) {
    return (v: number) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  }

  private updateChart(years: number[]) {
    if (!years || years.length === 0) {
      console.error("No years provided for the chart.");
      return;
  }


  const allTemperatures = this.data.flatMap(d => [d.min, d.max]);
  if (allTemperatures.length === 0) {
      console.error("No temperature data available for the chart.");
      return;
  }

  const x = d3.scaleLinear()
      .domain([Math.min(...allTemperatures) - 5, Math.max(...allTemperatures) + 5])
      .range([0, this.width]);

  const y = d3.scaleBand().domain(years.map(String)).range([this.height, 0]).padding(0.3); // Increased padding
  if (y.bandwidth() === 0) {
      console.error("Invalid y-axis scale. Check the input data or scale settings.");
      return;
  }

  this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x));

  this.svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(y));

  const thresholds = x.ticks(40);
  const kdeCurves = years.map(year => {
      const yearData = this.data.filter(d => d.year === year);
      return {
          year,
          minKde: this.kdeEstimator(this.kernelEpanechnikov(this.bandwidth), thresholds, yearData.map(d => d.min)),
          maxKde: this.kdeEstimator(this.kernelEpanechnikov(this.bandwidth), thresholds, yearData.map(d => d.max))
      };
  });

  if (kdeCurves.some(kde => kde.minKde.length === 0 || kde.maxKde.length === 0)) {
      console.error("KDE curves have invalid data.");
      return;
  }

  const line = d3
      .line()
      .curve(d3.curveBasis)
      .x(d => x(d[0]));

  const kdeGroups = this.svg
      .selectAll('.kde-group')
      .data(kdeCurves)
      .join('g')
      .attr('class', 'kde-group')
      .attr('transform', (d: { year: number; }) => {
        const yearStr = d.year.toString(); // Convert year to string
        const yPosition = y(yearStr);
        if (yPosition === undefined) {
            console.error("Year not found in Y scale domain:", yearStr);
            return "translate(0,0)";
        }
        return `translate(0,${yPosition + y.bandwidth() / 2})`;
    });

    kdeGroups
      .append('path')
      .attr('class', 'kde-line-min')
      .datum((d: { minKde: any; }) => d.minKde)
      .attr('fill', 'none')
      .attr('stroke', (d: { year: any; }) => this.colors(d.year))
      .attr('stroke-width', 4) // Increased stroke width
      .attr('d', line.y(d => -y.bandwidth() * d[1] - 10)); // Offset for Min curve

    kdeGroups
      .append('path')
      .attr('class', 'kde-line-max')
      .datum((d: { maxKde: any; }) => d.maxKde)
      .attr('fill', 'none')
      .attr('stroke', (d: { year: any; }) => d3.color(this.colors(d.year))?.brighter(1.5))
      .attr('stroke-width', 4) // Increased stroke width
      .attr('d', line.y(d => -y.bandwidth() * d[1] + 10)); // Offset for Max curve

    kdeGroups
      .on('mouseover', (event: any, d: { year: any; }) => {
        this.tooltip
          .style('opacity', 1)
          .html(`<strong>Year: ${d.year}</strong><br>Min & Max KDE curves`);
      })
      .on('mousemove', (event: { pageX: number; pageY: number; }) => {
        this.tooltip
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
    this.updateChart(this.colors.domain());
  }
}
