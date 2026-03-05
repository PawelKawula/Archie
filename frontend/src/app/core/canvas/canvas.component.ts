import {
  Component,
  type ElementRef,
  inject,
  type OnInit,
  viewChild,
} from '@angular/core';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { ContextMenu } from '../../shared/context-menu/context-menu.component';
import { Canvas as CanvasService } from './canvas.service';

@Component({
  selector: 'app-canvas',
  imports: [ContextMenu, HlmContextMenuImports, HlmDropdownMenuImports],
  templateUrl: './canvas.component.html',
  styles: ``,
})
export class Canvas implements OnInit {
  #canvas = inject(CanvasService);

  pixiContainer = viewChild.required<ElementRef>('pixiContainer');

  async ngOnInit() {
    await this.#canvas.init(this.pixiContainer());
  }
}
