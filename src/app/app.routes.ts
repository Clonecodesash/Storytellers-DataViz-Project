import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { CompcatComponent } from './compcat/compcat.component';
import { AlluvialComponent } from './alluvial/alluvial.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'comparing-categories', component: CompcatComponent},
    { path: 'alluvial', component: AlluvialComponent }
];
