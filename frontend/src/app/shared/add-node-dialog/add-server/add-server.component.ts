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
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import type { ServerOptionsFormGroupType } from '../../domain/server';

export const SERVER_ICONS = [
  { key: 'logos/pc.svg', label: 'PC' },
  { key: 'logos/hdd-rack.svg', label: 'Rack' },
  { key: 'logos/laptop.svg', label: 'Laptop' },
] as const;

@Component({
  selector: 'app-add-server',
  imports: [
    HlmLabelImports,
    HlmInputImports,
    HlmFieldImports,
    ReactiveFormsModule,
    HlmCardImports,
    HlmRadioGroupImports,
    HlmButtonImports,
  ],
  templateUrl: './add-server.component.html',
  styleUrl: './add-server.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddServer implements OnInit, OnDestroy {
  readonly #rootForm = inject(ControlContainer);
  readonly #initial = injectBrnDialogContext<{
    name?: string;
    icon?: string;
    [k: string]: unknown;
  }>({ optional: true });

  readonly icons = SERVER_ICONS;

  get form() {
    return this.#rootForm.control as ServerOptionsFormGroupType;
  }

  ngOnInit() {
    this.form.addControl(
      'name',
      new FormControl(this.#initial?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(32)],
      }),
    );
    this.form.addControl(
      'icon',
      new FormControl(
        (this.#initial?.icon ??
          SERVER_ICONS[0].key) as (typeof SERVER_ICONS)[number]['key'],
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
    );
  }

  ngOnDestroy(): void {
    // @ts-expect-error
    this.form.removeControl('name');
    // @ts-expect-error
    this.form.removeControl('icon');
  }

  selectIcon(key: string) {
    this.form.controls.icon.setValue(
      key as (typeof SERVER_ICONS)[number]['key'],
    );
  }
}
