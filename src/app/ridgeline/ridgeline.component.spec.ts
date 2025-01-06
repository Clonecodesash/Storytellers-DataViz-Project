import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RidgelineComponent } from './ridgeline.component';

describe('RidgelineComponent', () => {
  let component: RidgelineComponent;
  let fixture: ComponentFixture<RidgelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RidgelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RidgelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
