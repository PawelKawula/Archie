import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import type { ValueOfForm } from '../../../types';

type FormValue = ValueOfForm<AddNodeDialog['form']>;

@Component({
  selector: 'app-add-node-dialog',
  imports: [
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    ReactiveFormsModule,
  ],
  templateUrl: './add-node-dialog.component.html',
  styleUrl: './add-node-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNodeDialog {
  readonly #fb = inject(FormBuilder);
  readonly #dialogRef = inject<BrnDialogRef<FormValue>>(BrnDialogRef);

  public form = this.#fb.group({
    description: [
      'Placeholder text',
      [Validators.required, Validators.minLength(5), Validators.maxLength(32)],
    ],
  });

  submit() {
    this.#dialogRef.close(this.form.getRawValue());
  }

  cancel() {
    this.#dialogRef.close(undefined);
  }
}
