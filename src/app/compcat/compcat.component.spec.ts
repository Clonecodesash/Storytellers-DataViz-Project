import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompcatComponent } from './compcat.component';

describe('CompcatComponent', () => {
  let component: CompcatComponent;
  let fixture: ComponentFixture<CompcatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompcatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompcatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
