import { Component, HostListener } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [],
  templateUrl: './barchart.component.html',
  styleUrl: './barchart.component.css'
})
export class BarchartComponent {
  private data: any[] = [];
  private filteredData: any[] = [];
  private svg: any;
  private margin = { top: 50, right: 30, bottom: 50, left: 60 };
  private width: number;
  private height: number;
  private containerWidth = 750;
  private containerHeight = 450;

  constructor() {
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.createSvg();
    d3.csv('assets/dummy.csv').then(data => {
      this.data = data.map(d => ({
        country: d['Country'],
        emission: +d['Emission'],
        year: +d['Year']
      }));
      this.filteredData = this.data.filter(d => d.year === this.getAvailableYears()[0]);
      this.drawBars(this.filteredData);
      this.createYearSelector();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateChart();
  }

  private createSvg(): void {
    this.svg = d3.select('figure#bar')
      .append('svg')
      .attr('viewBox', `0 0 ${this.containerWidth} ${this.containerHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private drawBars(data: any[]): void {
    this.svg.selectAll('*').remove();

    data.sort((a, b) => b.emission - a.emission);

    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.country))
      .padding(0.2);

    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(0,10)')
      .style('text-anchor', 'middle');

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.emission) || 0])
      .range([this.height, 0]);

    this.svg.append('g')
      .call(d3.axisLeft(y));

    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('padding', '6px')
      .style('background', '#f4f4f4')
      .style('border', '1px solid #333')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    this.svg.selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.country))
      .attr('y', (d: any) => y(d.emission))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => this.height - y(d.emission))
      .attr('fill', '#8772d0')
      .on('mouseover', (event: MouseEvent, d: any) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).attr('fill', '#ff7f0e');
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`<strong>${d.country}</strong><br>Emission: ${d.emission.toFixed(2)}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: MouseEvent) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).attr('fill', '#8772d0');
        tooltip.transition().duration(200).style('opacity', 0);
      });
  }

  private createYearSelector(): void {
    const years = this.getAvailableYears();
    const selector = d3.select('#barYearSelector')
      .append('select')
      .attr('id', 'barYearSelect')
      .on('change', () => {
        const selectedYear = +d3.select('#barYearSelect').property('value');
        this.filteredData = this.data.filter(d => d.year === selectedYear);
        this.drawBars(this.filteredData);
      });

    selector.selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);
  }

  private getAvailableYears(): number[] {
    return Array.from(new Set(this.data.map(d => d.year))).sort();
  }

  private updateChart(): void {
    const container = d3.select('figure#bar').node() as HTMLElement;
    if (container) {
      const newWidth = container.clientWidth;
      this.width = newWidth - this.margin.left - this.margin.right;
      this.svg.attr('width', newWidth);
      this.drawBars(this.filteredData);
    }
  }
}
