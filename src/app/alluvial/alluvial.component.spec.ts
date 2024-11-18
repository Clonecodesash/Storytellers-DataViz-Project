import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlluvialComponent } from './alluvial.component';

describe('AlluvialComponent', () => {
  let component: AlluvialComponent;
  let fixture: ComponentFixture<AlluvialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlluvialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlluvialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
