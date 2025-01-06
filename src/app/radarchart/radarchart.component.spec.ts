import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadarchartComponent } from './radarchart.component';

describe('RadarchartComponent', () => {
  let component: RadarchartComponent;
  let fixture: ComponentFixture<RadarchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
