import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNodeDialog } from './add-node-dialog.component';

describe('AddNodeDialog', () => {
  let component: AddNodeDialog;
  let fixture: ComponentFixture<AddNodeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNodeDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddNodeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
