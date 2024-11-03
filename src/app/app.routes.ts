import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { CompcatComponent } from './compcat/compcat.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'comparing-categories', component: CompcatComponent}
];
