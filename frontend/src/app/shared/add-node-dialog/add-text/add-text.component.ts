import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import {
  ControlContainer,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import type { TextOptionsFormGroupType } from '../../domain/text';

@Component({
  selector: 'app-add-text',
  imports: [
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    ReactiveFormsModule,
  ],
  templateUrl: './add-text.component.html',
  styleUrl: './add-text.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddText implements OnInit, OnDestroy {
  readonly #rootForm = inject(ControlContainer);
  readonly #initial = injectBrnDialogContext<{
    name?: string;
    [k: string]: unknown;
  }>({ optional: true });

  get form() {
    return this.#rootForm.control as TextOptionsFormGroupType;
  }

  ngOnInit() {
    this.form.addControl(
      'name',
      new FormControl(this.#initial?.name ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(32),
        ],
      }),
    );
  }

  ngOnDestroy(): void {
    // @ts-expect-error
    this.form.removeControl('name');
  }
}
