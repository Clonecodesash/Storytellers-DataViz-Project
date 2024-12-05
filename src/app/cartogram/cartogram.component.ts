import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-cartogram',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cartogram.component.html',
  styleUrls: ['./cartogram.component.css']
})
export class CartogramComponent {
  public data: any[] = [];
  public years: number[] = [];
  public selectedYear: number = 2017; 

  private svg: any;
  private projection: any;
  private path: any;
  private width = 1000;  
  private height = 500;  
  private colorScale: any;
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.createSvg();
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateMapSize();
  }

  private updateMapSize(): void {
    const containerWidth = this.svg.node()?.getBoundingClientRect().width || this.width;
    const containerHeight = this.svg.node()?.getBoundingClientRect().height || this.height;
    this.projection.scale(containerWidth / 6).translate([containerWidth / 2, containerHeight / 1.5]);
    this.loadGeoJsonAndDrawCartogram();
  }

  private createSvg(): void {
    this.svg = d3
      .select(this.elementRef.nativeElement)
      .select('.cartogram-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.projection = d3.geoMercator();
    this.path = d3.geoPath().projection(this.projection);
  }

  private async loadData(): Promise<void> {
    this.data = await d3.csv('assets/cleaned_data.csv');

    this.years = Array.from(new Set(this.data.map((d: any) => +d.Year)));
    this.selectedYear = Math.max(...this.years); 
    this.loadGeoJsonAndDrawCartogram();
  }

  private async loadGeoJsonAndDrawCartogram(): Promise<void> {
    const worldMap = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    
    const mergedData = this.mergeData(worldMap, this.selectedYear);

    this.colorScale = this.createColorScale(mergedData);

    const cartogramData = this.createCartogramData(mergedData);

    this.drawCartogram(cartogramData);
  }

  private mergeData(geoJson: any, year: number): any {
    geoJson.features.forEach((feature: any) => {
      const countryData = this.data.find((d: any) => {
        const countryName = feature.properties.name.toLowerCase();
        const csvCountryName = this.normalizeCountryName(d.Country).toLowerCase().trim();
        return countryName === csvCountryName && +d.Year == year;
      });

      if (countryData) {
        feature.properties.Population_Emission = parseFloat(countryData.Population_Emission) || 0;
      } else {
        feature.properties.Population_Emission = 0;
      }
    });

    return geoJson;
  }

  private createColorScale(mergedData: any): any {
    const emissionMax: number = (d3.max(mergedData.features, (d: any) => d.properties.Population_Emission) as unknown as number) || 1;
    return d3.scaleSequential(d3.interpolateReds).domain([0, emissionMax]);
  }

  private createCartogramData(mergedData: any): any {
    const emissionMax: number = (d3.max(mergedData.features, (d: any) => d.properties.Population_Emission) as unknown as number) || 1;

    mergedData.features.forEach((feature: any) => {
      const scale = 1 + feature.properties.Population_Emission / emissionMax;
      feature.properties.scale = scale;
    });

    return mergedData;
  }

  private drawCartogram(cartogramData: any): void {
    this.svg.selectAll('*').remove();

    this.svg
      .selectAll('path')
      .data(cartogramData.features)
      .join('path')
      .attr('d', this.path)
      .attr('fill', (d: any) => this.colorScale(d.properties.Population_Emission))
      .attr('stroke', '#d3d3d3')
      .attr('stroke-width', 0.5)
      .attr('transform', (d: any) => {
        const scale = d.properties.scale;
        return `scale(${scale})`;
      })
      .on('mouseover', (event: any, d: any) => {
        const tooltip = d3
          .select(this.elementRef.nativeElement)
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('background-color', 'rgba(0, 0, 0, 0.7)')
          .style('color', 'white')
          .style('padding', '5px')
          .style('border-radius', '5px')
          .style('font-size', '12px')
          .style('z-index', '10');

        tooltip
          .html(
            `${d.properties.name}<br>Population Emission: ${d.properties.Population_Emission}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseout', () => {
        d3.select('.tooltip').remove();
      });
  }

  private normalizeCountryName(name: string): string {
    const nameMappings: { [key: string]: string } = {
      'united states': 'USA',
    };

    return nameMappings[name] || name;
  }

  onYearChange(selectedYear: number): void {
    this.selectedYear = selectedYear;
    this.loadGeoJsonAndDrawCartogram();
  }
}
