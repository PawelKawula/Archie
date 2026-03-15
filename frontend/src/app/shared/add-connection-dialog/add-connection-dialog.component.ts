import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { map, startWith } from 'rxjs';
import type { ValueOfForm } from '../../../types';
import type { ConnectionOptions } from '../domain/connection';

type FormValue = ValueOfForm<AddConnectionDialog['form']>;

@Component({
  selector: 'app-add-connection-dialog',
  imports: [
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    ReactiveFormsModule,
  ],
  templateUrl: './add-connection-dialog.component.html',
  styleUrl: './add-connection-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddConnectionDialog {
  readonly #fb = inject(FormBuilder);
  readonly #dialogRef = inject<BrnDialogRef<ConnectionOptions>>(BrnDialogRef);
  readonly #initial = injectBrnDialogContext<ConnectionOptions>({
    optional: true,
  });

  readonly isEditing = !!this.#initial;

  form = this.#fb.nonNullable.group({
    outQueueSize: this.#fb.nonNullable.control(
      this.#initial?.outQueueSize ?? 100,
      [Validators.required, Validators.min(1)],
    ),
    transitQueueSize: this.#fb.nonNullable.control(
      this.#initial?.transitQueueSize ?? 100,
      [Validators.required, Validators.min(1)],
    ),
    arrivedQueueSize: this.#fb.nonNullable.control(
      this.#initial?.arrivedQueueSize ?? 100,
      [Validators.required, Validators.min(1)],
    ),
  });

  isInvalid = toSignal(
    this.form.statusChanges.pipe(
      startWith(this.form.status),
      map((status) => status === 'INVALID'),
    ),
  );

  submit() {
    const value: FormValue = this.form.getRawValue();
    this.#dialogRef.close(value);
  }

  cancel() {
    this.#dialogRef.close(undefined);
  }
}
