import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  type OnInit,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { Orchestrator } from '../../core/orchestrator.service';
import {
  type ContextMenuRequest,
  ContextMenu as ContextMenuService,
} from '../context-menu.service';
import { Node } from '../domain/node';

@Component({
  selector: 'app-context-menu',
  imports: [HlmDropdownMenuImports, HlmContextMenuImports],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenu implements OnInit {
  #contextMenuService = inject(ContextMenuService);
  #destroyRef = inject(DestroyRef);
  #orchestrator = inject(Orchestrator);
  #cdr = inject(ChangeDetectorRef);

  menuTemplate = input<TemplateRef<unknown>>();
  requestedTemplate = signal<TemplateRef<unknown> | null | undefined>(null);
  requestedData = signal<unknown>(null);
  menuPosition = signal<{ clientX: number; clientY: number } | null>(null);

  menuAnchor = viewChild.required<ElementRef>('menuAnchor');

  ngOnInit(): void {
    this.#contextMenuService.openMenu$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((req) => {
        this.open(req);
      });
  }

  open({ event, containerRect, template, data }: ContextMenuRequest) {
    this.requestedTemplate.set(template);
    this.requestedData.set(data);
    this.menuPosition.set({ clientX: event.clientX, clientY: event.clientY });

    // We need to detect changes so that the hlmContextMenuTrigger input is updated
    // with the new template before we dispatch the contextmenu event.
    this.#cdr.detectChanges();

    const el = this.menuAnchor().nativeElement;

    el.style.left = `${event.clientX - (containerRect?.left ?? 0)}px`;
    el.style.top = `${event.clientY - (containerRect?.top ?? 0)}px`;

    const contextEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    el.dispatchEvent(contextEvent);
  }

  addNode() {
    const pos = this.menuPosition();
    if (pos === null) return;
    const node = new Node({
      name: 'New Text',
      x: pos.clientX,
      y: pos.clientY,
    });
    this.#orchestrator.addNode(node);
  }
}
