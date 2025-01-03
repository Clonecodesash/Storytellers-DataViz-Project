import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-map-density',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './map-density.component.html',
  styleUrl: './map-density.component.css'
})
export class MapDensityComponent {
  private width = 2000;
  private height = 875;
  private projection: any;
  private projection2: any;
  private path: any;
  private path2: any;
  private svg: any;
  private svg2: any;
  private data: any[] = [];
  public years: number[] = []; 
  public selectedYear: number = 2017; 

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.createSvg();
    this.createSvg2();
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateMapSize();
  }

  private updateMapSize(): void {
    const containerWidth = this.svg.node()?.getBoundingClientRect().width || 2000;
    const containerHeight = this.svg.node()?.getBoundingClientRect().height || 875;
    console.log('Container Width:', containerWidth, 'Container Height:', containerHeight);  // Debug log for container size
    this.projection.scale(containerWidth / 6).translate([containerWidth, containerHeight]);

    const containerWidth2 = this.svg2.node()?.getBoundingClientRect().width || 2000;
    const containerHeight2 = this.svg2.node()?.getBoundingClientRect().height || 875;
    this.projection2.scale(containerWidth2 / 6).translate([containerWidth2, containerHeight2]);

    this.loadGeoJsonAndDrawMap();
  }

  private createSvg(): void {
    this.svg = d3
      .select(this.elementRef.nativeElement)
      .select('.map-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 2000 875')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const containerWidth = this.svg.node()?.getBoundingClientRect().width || 2000;
    const containerHeight = this.svg.node()?.getBoundingClientRect().height || 875;

    this.projection = d3
      .geoMercator()
      .scale(containerWidth / 6)
      .translate([containerWidth, containerHeight]);

    this.path = d3.geoPath().projection(this.projection);
  }

  private createSvg2(): void {
    this.svg2 = d3
      .select(this.elementRef.nativeElement)
      .select('.map-container2')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 2000 875')
      .attr('preserveAspectRatio', 'xMidYMid meet');
    const containerWidth2 = this.svg2.node()?.getBoundingClientRect().width || 2000;
    const containerHeight2 = this.svg2.node()?.getBoundingClientRect().height || 875;

    this.projection2 = d3
      .geoAzimuthalEqualArea()
      .scale(containerWidth2 / 5)
      .translate([containerWidth2, containerHeight2]);

    this.path2 = d3.geoPath().projection(this.projection2);
  }

  private async loadData(): Promise<void> {
    this.data = await d3.csv('assets/cleaned_data.csv');
    this.years = Array.from(new Set(this.data.map((d: any) => +d.Year)));
    this.loadGeoJsonAndDrawMap();
  }

  private async loadGeoJsonAndDrawMap(): Promise<void> {
    const worldMap = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    const mergedData = this.mergeData(worldMap, this.selectedYear);
    const colorScale = this.createColorScale(mergedData);
    console.log('Merged Data:', mergedData);
    this.drawMap(this.svg, mergedData, colorScale, this.path);
    this.drawMap(this.svg2, mergedData, colorScale, this.path2);
  }

  private mergeData(geoJson: any, year: number): any {
    geoJson.features.forEach((feature: any) => {
      const countryData = this.data.find((d: any) => {
        const countryName = feature.properties.name.toLowerCase();
        const csvCountryName = this.normalizeCountryName(d.Country).toLowerCase().trim();
        return countryName === csvCountryName && +d.Year == year;
      });

      if (countryData) {
        feature.properties.Emission = parseFloat(countryData.Emission) || 0;
      } else {
        feature.properties.Emission = 0;
      }
    });

    return geoJson;
  }

  private createColorScale(mergedData: any): any {
    return d3.scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(mergedData.features, (d: any) => parseFloat(d.properties.Emission)) || 0]); // Color scale from white to dark red
  }

  private drawMap(svg: any, mergedData: any, colorScale: any, path: any): void {
    svg.selectAll('*').remove();
    svg
      .selectAll('path')
      .data(mergedData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d: any) => colorScale(d.properties.Emission))
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
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
            `${d.properties.name}<br>Emission Density: ${d.properties.Emission}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseout', () => {
        d3.select('.tooltip').remove();
      });

    svg
      .selectAll('path')
      .attr('stroke', '#d3d3d3')
      .attr('stroke-width', 1);
  }

  private normalizeCountryName(name: string): string {
    const nameMappings: { [key: string]: string } = {
      'united states': 'USA',
      // 'united kingdom': 'UK',
      // 'Russia': 'Russian Federation',
      // Add more mappings as needed
    };

    return nameMappings[name] || name;
  }

  onYearChange(selectedYear: number): void {
    this.selectedYear = selectedYear;
    this.loadGeoJsonAndDrawMap();
  }
}

