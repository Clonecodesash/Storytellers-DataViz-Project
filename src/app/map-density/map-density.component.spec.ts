import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDensityComponent } from './map-density.component';

describe('MapDensityComponent', () => {
  let component: MapDensityComponent;
  let fixture: ComponentFixture<MapDensityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDensityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapDensityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
