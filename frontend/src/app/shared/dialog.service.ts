import type { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import type { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmDialogService } from '@spartan-ng/helm/dialog';

export interface DialogRequest {
  component: ComponentType<unknown>;
  context: unknown;
  contentClass?: string;
  backdropClass?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly _hlmDialogService = inject(HlmDialogService);

  open<T>({ component, context, contentClass, backdropClass }: DialogRequest) {
    const dialogRef = this._hlmDialogService.open(component, {
      context,
      contentClass,
      backdropClass: backdropClass ?? 'bg-transparent',
    }) as BrnDialogRef<T>;

    return dialogRef.closed$;
  }
}
