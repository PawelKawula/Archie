import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  type OnInit,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { ContextMenu } from '../../shared/context-menu/context-menu.component';
import { Orchestrator } from '../orchestrator.service';
import { Canvas as CanvasService } from './canvas.service';

@Component({
  selector: 'app-canvas',
  imports: [ContextMenu, HlmContextMenuImports, HlmDropdownMenuImports],
  templateUrl: './canvas.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Canvas implements OnInit, AfterViewInit {
  #canvas = inject(CanvasService);
  protected orchestrator = inject(Orchestrator);

  pixiContainer = viewChild.required<ElementRef>('pixiContainer');
  nodeMenuTemplate =
    viewChild.required<TemplateRef<unknown>>('nodeMenuTemplate');
  stageMenuTemplate =
    viewChild.required<TemplateRef<unknown>>('stageMenuTemplate');

  async ngOnInit() {
    await this.#canvas.init(this.pixiContainer());
  }

  ngAfterViewInit() {
    this.orchestrator.nodeMenuTemplate.set(this.nodeMenuTemplate());
    this.orchestrator.stageMenuTemplate.set(this.stageMenuTemplate());
  }
}
