import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationPopover } from './simulation-popover.component';

describe('SimulationPopover', () => {
  let component: SimulationPopover;
  let fixture: ComponentFixture<SimulationPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationPopover],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationPopover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
