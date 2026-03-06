import { Injectable, type TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

export type ContextMenuRequest = {
  event: PointerEvent;
  containerRect?: DOMRect;
  template?: TemplateRef<unknown> | null;
  data?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class ContextMenu {
  private openMenuSource = new Subject<ContextMenuRequest>();
  openMenu$ = this.openMenuSource.asObservable();

  show(request: ContextMenuRequest) {
    this.openMenuSource.next(request);
  }
}
