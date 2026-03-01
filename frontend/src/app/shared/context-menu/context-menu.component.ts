import {
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  type OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import {
  type ContextMenuRequest,
  ContextMenu as ContextMenuService,
} from '../context-menu.service';

@Component({
  selector: 'app-context-menu',
  imports: [HlmDropdownMenuImports, HlmContextMenuImports],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenu implements OnInit {
  #contextMenuService = inject(ContextMenuService);
  #destroyRef = inject(DestroyRef);

  menuAnchor = viewChild.required<ElementRef>('menuAnchor');

  ngOnInit(): void {
    this.#contextMenuService.openMenu$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((ev) => this.open(ev));
  }

  open({ event, containerRect }: ContextMenuRequest) {
    const el = this.menuAnchor().nativeElement;

    el.style.left = `${event.clientX - (containerRect?.left ?? 0)}px`;
    el.style.top = `${event.clientY - (containerRect?.top ?? 0)}px`;

    const contextEvent = new MouseEvent('contextmenu', {
      bubbles: false,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    el.dispatchEvent(contextEvent);
  }
}
