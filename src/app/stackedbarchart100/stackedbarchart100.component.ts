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
  private colors = d3.scaleOrdinal(d3.schemeCategory10);
  private availableYears: number[] = [];
  private selectedYear!: number;

  constructor() {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.createSvg();
    d3.csv('assets/dummy2.csv').then(data => {
      this.data = data.map(d => ({
        region: d['Region'],
        country: d['Country'],
        year: +d['Year'],
        emission: +d['Emission']
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
    this.drawChart(filteredData);
  }

  private drawChart(data: any[]): void {
    this.svg.selectAll('*').remove();

    const groupedData = d3.group(data, d => d.region);
    const transformedData = Array.from(groupedData, ([region, values]) => {
      const totalEmission = d3.sum(values, d => d.emission);
      const obj: { [key: string]: number | string } = { region };
      values.forEach(v => {
        obj[v.country] = (v.emission / totalEmission) * 100;
      });
      return obj;
    });

    const countries = Array.from(new Set(data.map(d => d.country)));

    const stackData = d3.stack<{ [key: string]: number }>()
      .keys(countries)(transformedData as { [key: string]: number }[]);

    const regions = Array.from(new Set(data.map(d => d.region)));
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
      .call(d3.axisBottom(x));

    this.svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`));

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
      .style('fill', (d: { key: string; }) => this.colors(d.key))
      .selectAll('rect')
      .data((d: any) => d)
      .enter()
      .append('rect')
      .attr('x', (d: { data: { region: string; }; }) => x(d.data.region)!)
      .attr('y', (d: d3.NumberValue[]) => y(d[1]))
      .attr('height', (d: d3.NumberValue[]) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on('mouseover', (event: MouseEvent, d: any) => {
        const target = event.currentTarget as SVGRectElement;
        const parentNode = target.parentNode as SVGGElement;
        const parentData = d3.select(parentNode).datum() as d3.Series<{ [key: string]: number }, string>;
        const region = (d.data as any).region;
        const country = parentData.key;
        const percentage = (d[1] - d[0]).toFixed(2);

        d3.select(target).style('opacity', 0.7);
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(
          `<strong>Region: ${region}</strong><br>
    Country: ${country}<br>
    Percentage: ${percentage}%`
        )
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
  }

  private updateChartSize(): void {
    const container = d3.select('figure#stacked-bar-percentage').node() as HTMLElement;
    if (container) {
      const newWidth = container.clientWidth;
      this.width = newWidth - this.margin.left - this.margin.right;
      this.svg.attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
      this.filterAndDrawChart(this.selectedYear);
    }
  }
}
