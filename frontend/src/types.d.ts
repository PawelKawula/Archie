import type { AbstractControl } from '@angular/forms';

export type ValueOfForm<T extends AbstractControl> = ReturnType<
  T['getRawValue']
>;
