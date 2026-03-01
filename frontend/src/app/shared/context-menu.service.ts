import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ContextMenuRequest = {
  event: PointerEvent;
  containerRect?: DOMRect;
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
