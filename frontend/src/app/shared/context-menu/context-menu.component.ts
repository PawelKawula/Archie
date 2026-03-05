import {
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  type OnInit,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { BitmapText, Rectangle } from 'pixi.js';
import { BehaviorSubject } from 'rxjs';
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
})
export class ContextMenu implements OnInit {
  #contextMenuService = inject(ContextMenuService);
  #destroyRef = inject(DestroyRef);
  #orchestrator = inject(Orchestrator);
  menuTemplate = input<TemplateRef<unknown>>();
  menuPosition = new BehaviorSubject<MouseEvent | null>(null);

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
    this.menuPosition.next(contextEvent);
  }

  addNode() {
    console.log('add');
    const pos = this.menuPosition.value;
    console.log(pos);
    if (pos === null) throw Error('Assertion error');
    const text = new BitmapText({
      text: 'New Text',
      style: { fontFamily: 'Hack-Regular.fnt', fontSize: 12, fill: 'ffffff' },
    });
    text.position.set(pos.clientX, pos.clientY);
    const node = new Node({
      type: 'text',
      text: text,
      bounds: new Rectangle(pos.clientX, pos.clientY, 100, 100),
    });
    this.#orchestrator.addNode(node);
  }
}
