import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConnectionDialog } from './add-connection-dialog.component';

describe('AddConnectionDialog', () => {
  let component: AddConnectionDialog;
  let fixture: ComponentFixture<AddConnectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddConnectionDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddConnectionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
