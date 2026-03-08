import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { distinctUntilChanged, map, startWith } from 'rxjs';
import type { ValueOfForm } from '../../../types';
import { NODE_TYPES, type NodeFormGroupKeysType } from '../domain/node';
import { AddText } from './add-text/add-text.component';

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
    BrnSelectImports,
    HlmSelectImports,
    AddText,
  ],
  templateUrl: './add-node-dialog.component.html',
  styleUrl: './add-node-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNodeDialog implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #dialogRef = inject<BrnDialogRef<FormValue>>(BrnDialogRef);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);

  public form = this.#fb.group<NodeFormGroupKeysType>({
    type: this.#fb.nonNullable.control('text', [Validators.required]),
  });

  ngOnInit(): void {
    this.form.controls.type.valueChanges
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        startWith(this.form.controls.type.value),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.#cdr.detectChanges();
      });
  }

  isInvalid = toSignal(
    this.form.statusChanges.pipe(
      startWith(this.form.status),
      map((status) => status === 'INVALID'),
    ),
  );

  ngAfterViewInit(): void {
    this.form.controls.type.patchValue(this.form.controls.type.value);
  }

  submit() {
    this.#dialogRef.close(this.form.getRawValue());
  }

  cancel() {
    this.#dialogRef.close(undefined);
  }

  get nodeTypes() {
    return NODE_TYPES;
  }
}
