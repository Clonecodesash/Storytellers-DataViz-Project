import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LinechartComponent } from '../linechart/linechart.component';
import { RadarchartComponent } from "../radarchart/radarchart.component";
import { RidgelineComponent } from "../ridgeline/ridgeline.component";

@Component({
  selector: 'app-timelines',
  standalone: true,
  imports: [RouterModule, LinechartComponent, RadarchartComponent, RidgelineComponent],
  templateUrl: './timelines.component.html',
  styleUrl: './timelines.component.css'
})
export class TimelinesComponent {

}
