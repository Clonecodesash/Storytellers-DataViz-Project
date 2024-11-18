import { Component, HostListener } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-barchart',
  standalone: true,
  templateUrl: './barchart.component.html',
  styleUrl: './barchart.component.css'
})
export class BarchartComponent {
  private data: any[] = [];
  private filteredData: any[] = [];
  private svg: any;
  private margin = { top: 50, right: 30, bottom: 50, left: 100 };
  private width: number;
  private height: number;
  private countryRange = 15;

  constructor() {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.createSvg();
    d3.csv('assets/cleaned_data.csv').then(data => {
      this.data = data.map(d => ({
        country: d['Country'],
        emission: +d['Emission'],
        year: +d['Year'],
        region: d['Region']
      }));
      this.filteredData = this.filterDataByYearRegionAndRange(this.getAvailableYears()[0], this.getAvailableRegions()[0], this.countryRange);
      this.drawBars(this.filteredData);
      this.createYearSelector();
      this.createRegionSelector();
      this.createRangeSelector();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateChart();
  }

  private createSvg(): void {
    this.svg = d3.select('figure#bar')
      .append('svg')
      .attr('id', 'bar-svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private drawBars(data: any[]): void {
    this.svg.selectAll('*').remove();
    d3.select('#bar-svg')
    .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);

    data.sort((a, b) => b.emission - a.emission);

    const y = d3.scaleBand()
      .range([0, this.height])
      .domain(data.map(d => d.country))
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.emission) || 0])
      .range([0, this.width]);

    this.svg.append('g')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('text-anchor', 'end');

    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

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
      .attr('y', (d: any) => y(d.country))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d: any) => x(d.emission))
      .attr('fill', '#1f77b4')
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
        d3.select(target).attr('fill', '#1f77b4');
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
        const selectedRegion = d3.select('#barRegionSelect').property('value');
        this.filteredData = this.filterDataByYearRegionAndRange(selectedYear, selectedRegion, this.countryRange);
        this.drawBars(this.filteredData);
      });

    selector.selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);
  }

  private createRegionSelector(): void {
    const regions = this.getAvailableRegions();
    const selector = d3.select('#barRegionSelector')
      .append('select')
      .attr('id', 'barRegionSelect')
      .on('change', () => {
        const selectedRegion = d3.select('#barRegionSelect').property('value');
        const selectedYear = +d3.select('#barYearSelect').property('value');
        this.filteredData = this.filterDataByYearRegionAndRange(selectedYear, selectedRegion, this.countryRange);
        this.drawBars(this.filteredData);
      });

    selector.selectAll('option')
      .data(regions)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);
  }

  private createRangeSelector(): void {
    const ranges = [15, 30, 50];
    const selector = d3.select('#barRangeSelector')
      .append('select')
      .attr('id', 'barRangeSelect')
      .on('change', () => {
        this.countryRange = +d3.select('#barRangeSelect').property('value');
        const selectedYear = +d3.select('#barYearSelect').property('value');
        const selectedRegion = d3.select('#barRegionSelect').property('value');
        this.filteredData = this.filterDataByYearRegionAndRange(selectedYear, selectedRegion, this.countryRange);
        this.drawBars(this.filteredData);
      });

    selector.selectAll('option')
      .data(ranges)
      .enter()
      .append('option')
      .text(d => `${d} countries`)
      .attr('value', d => d);
  }

  private filterDataByYearRegionAndRange(year: number, region: string, range: number): any[] {
    return this.data.filter(d => d.year === year && d.region === region)
      .sort((a, b) => b.emission - a.emission)
      .slice(0, range);
  }

  private getAvailableYears(): number[] {
    return Array.from(new Set(this.data.map(d => d.year))).sort();
  }

  private getAvailableRegions(): string[] {
    return Array.from(new Set(this.data.map(d => d.region))).sort();
  }

  private updateChart(): void {
    const container = d3.select('figure#bar').node() as HTMLElement;
    if (container) {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      this.width = newWidth - this.margin.left - this.margin.right;
      this.height = Math.max(300, newHeight - this.margin.top - this.margin.bottom);
      this.svg.attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
      this.drawBars(this.filteredData);
    }
  }
}