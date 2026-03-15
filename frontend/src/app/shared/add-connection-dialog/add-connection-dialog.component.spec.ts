import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { vi } from 'vitest';
import { AddConnectionDialog } from './add-connection-dialog.component';

describe('AddConnectionDialog', () => {
  let component: AddConnectionDialog;
  let fixture: ComponentFixture<AddConnectionDialog>;
  const mockDialogRef = {
    close: vi.fn(),
    setAriaLabelledBy: vi.fn(),
    setAriaDescribedBy: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddConnectionDialog],
      providers: [{ provide: BrnDialogRef, useValue: mockDialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddConnectionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when a queue size is below the minimum', () => {
    expect(component.form.invalid).toBe(false);
    component.form.setValue({
      outQueueSize: 0,
      transitQueueSize: 0,
      arrivedQueueSize: 0,
    });
    expect(component.form.invalid).toBe(true);
  });

  it('form is valid with default values', () => {
    expect(component.isInvalid()).toBe(false);
  });

  it('cancel closes the dialog with undefined', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('submit closes the dialog with queue sizes', () => {
    component.submit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      outQueueSize: 100,
      transitQueueSize: 100,
      arrivedQueueSize: 100,
    });
  });
});
