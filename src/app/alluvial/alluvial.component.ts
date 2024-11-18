import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

@Component({
  selector: 'app-alluvial',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './alluvial.component.html',
  styleUrl: './alluvial.component.css'
})
export class AlluvialComponent {
  private data: any[] = [];
  private filteredData: any[] = [];
  private svg: any;
  private sankeyGenerator: any;
  private width: number;
  private height: number;
  private margin = { top: 10, right: 10, bottom: 10, left: 10 };
  private currentIndex: number = 0;
  private years: number[] = [];
  topNOptions: number[] = [15, 30, 50]; // Top N selector options
  selectedTopN: number = 15; // Default top N
  selectedYear: number = new Date().getFullYear(); // Default year

  constructor() {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 450 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.createSvg();
    d3.csv('assets/alluvial_data.csv').then(data => {
      this.data = data.map(d => ({
        country: d['Country'],
        continent: d['Continent'],
        emission_land: +d['Emission_land'],
        emission_fossil: +d['Emission_fossil'],
        year: +d['Year']
      }));
      this.years = this.getAvailableYears();
      this.selectedYear = this.years[0];
      this.filteredData = this.getFilteredData();
      this.drawSankey(this.filteredData);
      this.createYearSelector();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateChart();
  }
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.nextYear();
    else if (event.key === 'ArrowLeft') this.previousYear();
  }


  private createSvg(): void {
    this.svg = d3.select('figure#sankey')
      .append('svg')
      .attr('id', 'sankey-svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private drawSankey(data: any[]): void {
    this.svg.selectAll('*').remove();
    d3.select('#sankey-svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);

    const nodes: Set<string> = new Set();
    const links: { source: any; target: any; value: any; }[] = [];

    data.forEach(d => {
      nodes.add(d.continent);
      nodes.add(d.country);
      links.push({ source: d.continent, target: d.country, value: d.emission_land });
      links.push({ source: d.country, target: 'Land Emission', value: d.emission_land });
      links.push({ source: d.country, target: 'Fossil Emission', value: d.emission_fossil });
    });

    nodes.add('Land Emission');
    nodes.add('Fossil Emission');

    const uniqueNodes = Array.from(nodes).map(name => ({ name }));

    const sankeyData = {
      nodes: uniqueNodes,
      links: links.map(link => ({
        source: uniqueNodes.findIndex(node => node.name === link.source),
        target: uniqueNodes.findIndex(node => node.name === link.target),
        value: link.value
      }))
    };

    // Check for missing indices
    if (sankeyData.links.some(link => link.source === -1 || link.target === -1)) {
      console.error('Missing nodes in links:', sankeyData.links.filter(link => link.source === -1 || link.target === -1));
      return;
    }

    this.adjustSvgHeight(data.length);

    this.sankeyGenerator = sankey<{ name: string }, { value: number }>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [this.width - 1, this.height - 6]]);

    const sankeyGraph = this.sankeyGenerator(sankeyData as any);
    this.svg.transition().duration(1000).ease(d3.easeCubicOut);
    this.renderSankeyGraph(sankeyGraph);
  }

  private renderSankeyGraph(sankeyGraph: any): void {
    const nodes = this.svg.append('g')
      .selectAll('rect')
      .data(sankeyGraph.nodes)
      .enter()
      .append('rect')
      .attr('x', (d: { x0: any; }) => d.x0)
      .attr('y', (d: { y0: any; }) => d.y0)
      .attr('height', (d: { y1: number; y0: number; }) => d.y1 - d.y0)
      .attr('width', (d: { x1: number; x0: number; }) => d.x1 - d.x0)
      .attr('fill', (d: any, i: number) => d3.schemeCategory10[i % 10])
      .append('title')
      .text((d: { name: any; value: any; }) => `${d.name}\n${d.value}`);

    this.svg.append('g')
      .selectAll('text')
      .data(sankeyGraph.nodes)
      .enter()
      .append('text')
      .attr('x', (d: { x0: number; x1: number; }) => d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', (d: { y0: any; y1: any; }) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: { x0: number; }) => d.x0 < this.width / 2 ? 'start' : 'end')
      .text((d: { name: any; }) => d.name)
      .style('font-size', '12px');

    const links = this.svg.append('g')
      .selectAll('path')
      .data(sankeyGraph.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke-width', (d: { width: number; }) => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(0, 0, 0, 0.2)')
      .on('mouseover', (event: { target: any; pageX: number; pageY: number; }, d: { source: { name: any; }; target: { name: any; }; value: any; }) => {
        d3.select(event.target).attr('stroke', 'orange');
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`<strong>${d.source.name} → ${d.target.name}</strong><br>Emission: ${d.value}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', (event: { pageX: number; pageY: number; }) => {
        tooltip.style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: { target: any; }, d: any) => {
        d3.select(event.target).attr('stroke', 'rgba(0, 0, 0, 0.2)');
        tooltip.transition().duration(500).style('opacity', 0);
      });

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  }

  private createYearSelector(): void {
    const years = this.getAvailableYears();
    d3.select('#alluvialYearSelector')
      .append('select')
      .attr('id', 'alluvial-year-select')
      .on('change', () => {
        this.selectedYear = +d3.select('#alluvialYearSelector select').property('value');
        this.currentIndex = years.indexOf(this.selectedYear);
        this.filteredData = this.getFilteredData();
        this.drawSankey(this.filteredData);
      })
      .selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);

    this.updateYearSelector();
  }

  private getFilteredData(): any[] {
    return this.data
      .filter(d => d.year === this.selectedYear)
      .sort((a, b) => (b.emission_land + b.emission_fossil) - (a.emission_land + a.emission_fossil))
      .slice(0, this.selectedTopN);
  }


  private updateYearSelector(): void {
    const yearSelect = d3.select('#alluvial-year-select');
    if (yearSelect) {
      yearSelect.property('value', this.years[this.currentIndex]);
    }
  }
  
  private getAvailableYears(): number[] {
    return Array.from(new Set(this.data.map(d => d.year))).sort();
  }

  private nextYear(): void {
    if (this.currentIndex < this.years.length - 1) {
      this.currentIndex++;
      this.selectedYear = this.years[this.currentIndex];
      this.filteredData = this.getFilteredData();
      this.drawSankey(this.filteredData);
      this.updateYearSelector();
    }
  }

  private previousYear(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedYear = this.years[this.currentIndex];
      this.filteredData = this.getFilteredData();
      this.drawSankey(this.filteredData);
      this.updateYearSelector();
    }
  }

  private updateChart(): void {
    const container = d3.select('figure#sankey').node() as HTMLElement;
    if (container) {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      this.width = Math.max(400, newWidth - this.margin.left - this.margin.right);
      this.height = Math.max(350, newHeight - this.margin.top - this.margin.bottom);
      this.svg.attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
      this.drawSankey(this.filteredData);
    }
  }

  public onTopNSelect(event: Event): void {
    this.selectedTopN = +(event.target as HTMLSelectElement).value;
    this.filteredData = this.getFilteredData();
    this.drawSankey(this.filteredData);
  }

  private adjustSvgHeight(dataLength: number): void {
    this.height = 30 * dataLength;
    d3.select('svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
  }
}
