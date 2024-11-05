import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BarchartComponent } from "../barchart/barchart.component";
import { StackedbarchartComponent } from "../stackedbarchart/stackedbarchart.component";
import { StackedbarchartmultComponent } from '../stackedbarchartmult/stackedbarchartmult.component';
import { Stackedbarchart100Component } from '../stackedbarchart100/stackedbarchart100.component';
import { HeatmapComponent } from "../heatmap/heatmap.component";

@Component({
  selector: 'app-compcat',
  standalone: true,
  imports: [RouterModule, BarchartComponent, StackedbarchartComponent, StackedbarchartmultComponent, Stackedbarchart100Component, HeatmapComponent],
  templateUrl: './compcat.component.html',
  styleUrl: './compcat.component.css'
})
export class CompcatComponent {

}
