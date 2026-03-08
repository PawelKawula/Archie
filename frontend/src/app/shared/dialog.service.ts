import type { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import { HlmDialogService } from '@spartan-ng/helm/dialog';

export interface DialogRequest {
  component: ComponentType<unknown>;
  context: unknown;
  contentClass?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly _hlmDialogService = inject(HlmDialogService);

  open({ component, context, contentClass }: DialogRequest) {
    const dialogRef = this._hlmDialogService.open(component, {
      context,
      contentClass,
    });

    return dialogRef.closed$;
  }
}
