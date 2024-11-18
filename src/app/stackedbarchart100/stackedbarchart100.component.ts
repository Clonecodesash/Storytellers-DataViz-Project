import { Component, HostListener } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-stackedbarchart100',
  standalone: true,
  imports: [],
  templateUrl: './stackedbarchart100.component.html',
  styleUrl: './stackedbarchart100.component.css'
})
export class Stackedbarchart100Component {
  private data: any[] = [];
  private svg: any;
  private margin = { top: 50, right: 30, bottom: 50, left: 60 };
  private width: number;
  private height: number;
  private colors = d3.scaleOrdinal()
    .domain(['1', '2', '3', '4', '5', '6'])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']);
  private availableYears: number[] = [];
  private selectedYear!: number;

  constructor() {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.createSvg();
    d3.csv('assets/cleaned_data1.csv').then(data => {
      this.data = data.map(d => ({
        region: d['Region'],
        country: d['Country'],
        year: +d['Year'],
        emission: +d['Population_Emission']
      }));

      this.availableYears = Array.from(new Set(this.data.map(d => d.year))).sort();
      this.selectedYear = this.availableYears[0];

      this.createYearSelector();
      this.filterAndDrawChart(this.selectedYear);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateChartSize();
  }

  private createSvg(): void {
    this.svg = d3.select('figure#stacked-bar-percentage')
      .append('svg')
      .attr('id', 'stacked-bar-percent-svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private createYearSelector(): void {
    const selector = d3.select('#stackedYearSelectorPercentage')
      .append('select')
      .attr('id', 'stackedYearSelectPercentage')
      .on('change', () => {
        this.selectedYear = +d3.select('#stackedYearSelectPercentage').property('value');
        this.filterAndDrawChart(this.selectedYear);
      });

    selector.selectAll('option')
      .data(this.availableYears)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);
  }

  private filterAndDrawChart(year: number): void {
    const filteredData = this.data.filter(d => d.year === year);
    d3.select('#stacked-bar-percent-svg')
    .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
    this.normalizeData(filteredData);
    this.drawChart(filteredData);
  }

  private normalizeData(data: any[]): void {
    const groupedData = d3.group(data, d => d.region);
    groupedData.forEach(values => {
      const total = d3.sum(values, v => v.emission);
      values.sort((a, b) => b.emission - a.emission);
      values.forEach((v, i) => {
        v.rank = i + 1;
        v.normalizedEmission = (v.emission / total) * 100;
      });
    });
  }

  private drawChart(data: any[]): void {
    this.svg.selectAll('*').remove();

    const groupedData = d3.group(data, d => d.region);
    const transformedData = Array.from(groupedData, ([region, values]) => {
      const obj: { [key: string]: number | string } = { region };
      values.forEach(v => {
        obj[v.country] = v.normalizedEmission;
      });
      return obj;
    });

    const sortedCountries = Array.from(new Set(data.map(d => d.country)))
      .sort((a, b) => {
        const rankA = data.find(d => d.country === a)?.rank ?? Infinity;
        const rankB = data.find(d => d.country === b)?.rank ?? Infinity;
        return rankA - rankB;
      });

    const stackData = d3.stack<{ [key: string]: number }>()
      .keys(sortedCountries)(transformedData as { [key: string]: number }[]);

    const regions = Array.from(groupedData.keys());
    const x = d3.scaleBand()
      .domain(regions)
      .range([0, this.width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .nice()
      .range([this.height, 0]);

    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

    this.svg.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`).tickSize(0).tickPadding(10));

    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('padding', '6px')
      .style('background', '#f4f4f4')
      .style('border', '1px solid #333')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    this.svg.selectAll('g.layer')
      .data(stackData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .selectAll('rect')
      .data((d: { map: (arg0: (v: any) => any) => any; key: any; }) => d.map((v: any) => ({ ...v, country: d.key })))
      .enter()
      .append('rect')
      .attr('x', (d: { data: { region: string; }; }) => x(d.data.region)!)
      .attr('y', (d: d3.NumberValue[]) => y(d[1]))
      .attr('height', (d: d3.NumberValue[]) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .style('fill', (d: { country: any; }) => this.colors(String(data.find(v => v.country === d.country)?.rank)))
      .on('mouseover', (event: MouseEvent, d: any) => {
        const target = event.currentTarget as SVGRectElement;
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(
          `<strong>Region: ${d.data.region}</strong><br>
           Country: ${d.country}<br>
           Emission: ${(d[1] - d[0]).toFixed(2)}%`
        )
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        d3.select(target).style('opacity', 0.7);
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: MouseEvent) => {
        tooltip.transition().duration(500).style('opacity', 0);
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).style('opacity', 1);
      });
  }

  private updateChartSize(): void {
    const container = d3.select('figure#stacked-bar-percentage').node() as HTMLElement;
    if (container) {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      this.width = Math.max(350, newWidth - this.margin.left - this.margin.right);
      this.height = Math.max(300, newHeight - this.margin.top - this.margin.bottom);
      this.svg.attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
      this.filterAndDrawChart(this.selectedYear);
    }
  }
}
