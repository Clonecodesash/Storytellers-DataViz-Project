import { Component, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-radarchart',
  standalone: true,
  imports: [],
  templateUrl: './radarchart.component.html',
  styleUrl: './radarchart.component.css'
})
export class RadarchartComponent {

  private data: any[] = [];
  private svg: any;
  private legend: any;
  private margin = { top: 70, right: 70, bottom: 70, left: 70 };
  private width!: number;
  private height!: number;
  private radius!: number;
  private years: number[] = [];
  private colors: any;
  private tooltip: any;

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
      avg: d.Avg_Temperature,
    }));

    // Get the most recent 5 years
    const allYears = Array.from(new Set(this.data.map(d => d.year))).sort((a, b) => b - a);
    this.years = allYears.slice(0, 10);

    // Filter data for only these 5 years
    this.data = this.data.filter(d => this.years.includes(d.year));

    this.colors = d3.scaleOrdinal(d3.schemeCategory10).domain(this.years.map(String));
    this.createChart();
    this.updateChart();
  }

  private setChartDimensions() {
    const container = this.el.nativeElement.querySelector('.chart-container');
    this.width = container.clientWidth - this.margin.left - this.margin.right;
    this.height = Math.min(this.width, 600) - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;
  }

  private createChart() {
    const container = d3.select(this.el.nativeElement).select('.chart-container');
    container.selectAll('*').remove();

    this.svg = container
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

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

    this.legend = d3.select(this.el.nativeElement).select('.legend-container');
  }

  private updateChart() {
    const months = [...Array(12).keys()].map(i => i + 1); // Months 1-12
    const angleSlice = (Math.PI * 2) / months.length;

    const maxValue = d3.max(this.data, d => d.avg) || 100;
    const radiusScale = d3.scaleLinear().range([0, this.radius]).domain([0, maxValue]);

    // Draw gridlines with labeled values
    this.svg
      .selectAll('.gridline')
      .data([0.25, 0.5, 0.75, 1].map(d => d * maxValue))
      .join('circle')
      .attr('class', 'gridline')
      .attr('r', (d: d3.NumberValue) => radiusScale(d))
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '3 3');

    this.svg
      .selectAll('.grid-label')
      .data([0.25, 0.5, 0.75, 1].map(d => d * maxValue))
      .join('text')
      .attr('class', 'grid-label')
      .attr('x', 0)
      .attr('y', (d: d3.NumberValue) => -radiusScale(d))
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .text((d: number) => `${Math.round(d)}°C`)
      .style('font-size', '12px')
      .style('fill', '#333');

    // Draw axis lines
    this.svg
      .selectAll('.axis')
      .data(months)
      .join('line')
      .attr('class', 'axis')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d: number) => radiusScale(maxValue) * Math.cos(angleSlice * (d - 1) - Math.PI / 2))
      .attr('y2', (d: number) => radiusScale(maxValue) * Math.sin(angleSlice * (d - 1) - Math.PI / 2))
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Draw axis labels
    this.svg
      .selectAll('.axis-label')
      .data(months)
      .join('text')
      .attr('class', 'axis-label')
      .attr('x', (d: number) => (radiusScale(maxValue) + 10) * Math.cos(angleSlice * (d - 1) - Math.PI / 2))
      .attr('y', (d: number) => (radiusScale(maxValue) + 10) * Math.sin(angleSlice * (d - 1) - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d: number) => d3.timeFormat('%B')(new Date(0, d - 1)))
      .style('font-size', '14px')
      .style('font-weight', 'bold');

    // Draw radar chart
    const line = d3.lineRadial()
      .angle((d, i) => angleSlice * i)
      .radius(d => radiusScale(d[1]))
      .curve(d3.curveLinearClosed);

    const yearGroups = d3.group(this.data, d => d.year);

    this.svg
      .selectAll('.radar-line')
      .data([...yearGroups.entries()])
      .join('path')
      .attr('class', 'radar-line')
      .attr('d', ([, values]: [number, { avg: number }[]]) => line(values.map((d, i) => [i, d.avg])))
      .attr('fill', 'none')
      .attr('stroke', ([year]: [number, { avg: number }[]]) => this.colors(year))
      .attr('stroke-width', 3)
      .on('mouseover', (event: any, [year]: any) => {
        this.tooltip.style('opacity', 1).html(`Year: ${year}`);
      })
      .on('mousemove', (event: { pageX: number; pageY: number; }) => {
        this.tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
      });

    // Update legend for years
    this.updateLegend();
  }

  private updateLegend() {
    this.legend.html('');

    this.legend
      .append('div')
      .attr('class', 'year-legend')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('flex-wrap', 'wrap')
      .style('align-items', 'center')
      .html(
        this.years
          .map(
            year => `
            <div style="display: flex; align-items: center; margin-right: 10px;">
              <div style="width: 12px; height: 12px; background-color: ${this.colors(year)}; margin-right: 5px;"></div>
              ${year}
            </div>`
          )
          .join('')
      );
  }

  private onResize() {
    this.setChartDimensions();
    this.createChart();
    this.updateChart();
  }
}
