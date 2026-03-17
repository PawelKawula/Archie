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
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import type { FormType, T } from 'ngx-mf';

type PacketSourceOptionsFormGroupType = FormType<{
  type: 'source';
  name: string;
}>[T];

@Component({
  selector: 'app-add-packet-source',
  imports: [HlmLabelImports, HlmInputImports, HlmFieldImports, ReactiveFormsModule],
  templateUrl: './add-packet-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPacketSource implements OnInit, OnDestroy {
  readonly #rootForm = inject(ControlContainer);
  readonly #initial = injectBrnDialogContext<{
    name?: string;
    [k: string]: unknown;
  }>({ optional: true });

  get form() {
    return this.#rootForm.control as PacketSourceOptionsFormGroupType;
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
