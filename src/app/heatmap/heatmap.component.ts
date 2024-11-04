import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements OnInit {
  private data: any[] = [];
  private svg: any;
  private margin = { top: 50, right: 30, bottom: 50, left: 100 };
  private width!: number;
  private height!: number;
  private colorScale: any;
  availableDecades: number[] = [];
  selectedDecade!: number;

  constructor() {
    this.setChartDimensions();
  }

  ngOnInit(): void {
    d3.csv('/assets/dummy3.csv').then(data => {
      this.data = data.map(d => ({
        country: d['country'],
        type: d['type'],
        decade: +d['decade'],
        emission: +d['emission']
      }));

      // Get unique decades from the data
      this.availableDecades = Array.from(new Set(this.data.map(d => d.decade))).sort();
      this.selectedDecade = this.availableDecades[0]; // Set the initial selected decade

      this.createHeatmap();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setChartDimensions();
    this.createHeatmap();
  }

  onDecadeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedDecade = +selectedValue;
    this.createHeatmap();
  }

  private setChartDimensions(): void {
    const containerWidth = document.getElementById('heatmap')?.clientWidth || 800;
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom; // You can adjust this as needed
  }

  private createHeatmap(): void {
    // Clear any existing content
    d3.select('figure#heatmap').selectAll('*').remove();

    // Create SVG container
    this.svg = d3.select('figure#heatmap')
      .append('svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content-responsive', true)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Filter data for the selected decade and limit to 10 countries
    const filteredData = this.data.filter(d => d.decade === this.selectedDecade).slice(0, 10);

    // Extract unique types and countries
    const types = Array.from(new Set(filteredData.map(d => d.type)));
    const countries = Array.from(new Set(filteredData.map(d => d.country)));

    // Create scales
    const x = d3.scaleBand()
      .domain(types)
      .range([0, this.width])
      .padding(0.1);

    const y = d3.scaleBand()
      .domain(countries)
      .range([0, this.height])
      .padding(0.1);

    // Create color scale
    this.colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(filteredData, d => d.emission) || 1]);

    // Draw the heatmap cells
    this.svg.selectAll()
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('x', (d: { type: string }) => x(d.type)!)
      .attr('y', (d: { country: string }) => y(d.country)!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: { emission: any }) => this.colorScale(d.emission))
      .on('mouseover', (event: MouseEvent, d: any) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).style('stroke', '#333').style('stroke-width', 2);

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`<strong>Country: ${d.country}</strong><br>Type: ${d.type}<br>Emission: ${d.emission.toFixed(2)}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: MouseEvent) => {
        const target = event.currentTarget as SVGRectElement;
        d3.select(target).style('stroke', 'none');

        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('padding', '6px')
      .style('background', '#f4f4f4')
      .style('border', '1px solid #333')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Add X axis
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('transform', 'translate(0,10)')
      .style('text-anchor', 'middle');

    // Add Y axis
    this.svg.append('g')
      .call(d3.axisLeft(y).tickSize(0));
  }
}
