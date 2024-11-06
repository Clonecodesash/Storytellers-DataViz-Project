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
  private margin = { top: 40, right: 10, bottom: 40, left: 50 };
  private width = 100;
  private height = 200;
  private selectedYear!: number;
  private availableYears: number[] = [];
  private colors = d3.scaleOrdinal()
    .domain(['1', '2', '3', '4', '5', '6'])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']);

  constructor() { }

  ngOnInit(): void {
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
      this.filterAndDrawCharts(this.selectedYear);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.filterAndDrawCharts(this.selectedYear);
  }

  private createYearSelector(): void {
    const selector = d3.select('#smallMultiplesYearSelector')
      .append('select')
      .attr('id', 'smallMultiplesYearSelect')
      .on('change', () => {
        this.selectedYear = +d3.select('#smallMultiplesYearSelect').property('value');
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
    this.drawCharts(filteredData);
  }

  private drawCharts(data: any[]): void {
    d3.select('#smallMultiplesContainer').html('');

    const groupedData = d3.group(data, d => d.region);

    groupedData.forEach((regionData, region) => {
      regionData.sort((a, b) => b.emission - a.emission);
      regionData.forEach((d, i) => (d.rank = i + 1));

      const container = d3.select('#smallMultiplesContainer')
        .append('div')
        .attr('class', 'chart-container')
        .style('display', 'inline-block')
        .style('margin', '20px');

      const svg = container.append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

      const y = d3.scaleBand()
        .domain(regionData.map(d => d.country))
        .range([0, this.height])
        .padding(0.1);

      const x = d3.scalePow()
        .exponent(0.5)
        .domain([0, d3.max(regionData, d => d.emission) || 0])
        .nice()
        .range([0, this.width]);

      svg.append('g')
        .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0).tickPadding(10));

      svg.append('g')
        .attr('transform', `translate(0,${this.height})`)
        .call(d3.axisBottom(x).tickSize(0).tickFormat(() => ''));

      const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('padding', '6px')
        .style('background', '#f4f4f4')
        .style('border', '1px solid #333')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('opacity', 0);


      svg.selectAll('.bar')
        .data(regionData)
        .enter()
        .append('rect')
        .attr('y', d => y(d.country)!)
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('width', d => x(d.emission))
        .attr('fill', d => this.colors(String(d.rank)) as string)
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget).style('opacity', 0.8);
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip.html(
            `<strong>Country:</strong> ${d.country}<br>
            <strong>Emission:</strong> ${d.emission}<br>
            <strong>Rank:</strong> ${d.rank}`
          )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mousemove', event => {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', event => {
          d3.select(event.currentTarget).style('opacity', 1);
          tooltip.transition().duration(500).style('opacity', 0);
        });

      container.append('h4')
        .style('text-align', 'center')
        .text(region);
    });
  }
}
