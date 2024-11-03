import { Component, HostListener } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-stackedbarchartmult',
  standalone: true,
  imports: [],
  templateUrl: './stackedbarchartmult.component.html',
  styleUrl: './stackedbarchartmult.component.css'
})
export class StackedbarchartmultComponent {
  private data: any[] = [];
  private svg: any;
  private margin = { top: 30, right: 20, bottom: 40, left: 50 };
  private width: number;
  private height: number;
  private colors = d3.scaleOrdinal(d3.schemeCategory10);
  private availableYears: number[] = [];
  private selectedYear!: number;

  constructor() {
    this.width = 250 - this.margin.left - this.margin.right; 
    this.height = 200 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    d3.csv('/assets/dummy2.csv').then(data => {
      this.data = data.map(d => ({
        region: d['Region'],
        country: d['Country'],
        year: +d['Year'],
        emission: +d['Emission']
      }));

      this.availableYears = Array.from(new Set(this.data.map(d => d.year))).sort();
      this.selectedYear = this.availableYears[0];

      this.createYearSelector();
      this.filterAndDrawCharts(this.selectedYear);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.filterAndDrawCharts(this.selectedYear);
  }

  private createYearSelector(): void {
    const selector = d3.select('#yearDropdownMultiples')
      .append('select')
      .attr('id', 'yearDropdownMultiplesSelect')
      .on('change', () => {
        this.selectedYear = +d3.select('#yearDropdownMultiplesSelect').property('value');
        this.filterAndDrawCharts(this.selectedYear);
      });

    selector.selectAll('option')
      .data(this.availableYears)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);
  }

  private filterAndDrawCharts(year: number): void {
    const filteredData = this.data.filter(d => d.year === year);
    const groupedData = d3.group(filteredData, d => d.region);

    const totals = Array.from(groupedData, ([region, values]) => ({
      region,
      total: d3.sum(values, d => d.emission)
    })).sort((a, b) => b.total - a.total);

    d3.select('#chartsContainer').selectAll('*').remove();

    totals.forEach(({ region }) => {
      const regionData = groupedData.get(region);
      if (regionData) {
        this.drawChart(region, regionData);
      }
    });
  }

  private drawChart(region: string, data: any[]): void {
    const svg = d3.select('#chartsContainer')
      .append('div')
      .style('display', 'inline-block')
      .style('margin', '10px')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const countries = Array.from(new Set(data.map(d => d.country)));
    const x = d3.scaleBand()
      .domain(countries)
      .range([0, this.width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.emission) || 0])
      .nice()
      .range([this.height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y));

    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('padding', '6px')
      .style('background', '#f4f4f4')
      .style('border', '1px solid #333')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.country)!)
      .attr('y', d => y(d.emission))
      .attr('width', x.bandwidth())
      .attr('height', d => this.height - y(d.emission))
      .attr('fill', d => this.colors(d.country))
      .on('mouseover', (event: MouseEvent, d: any) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).style('opacity', 0.7);
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`<strong>Country: ${d.country}</strong><br>Emission: ${d.emission.toFixed(2)}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: MouseEvent) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).style('opacity', 1);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(region);
  }
}
