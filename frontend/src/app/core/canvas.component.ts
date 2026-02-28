import { Component, inject, type OnInit } from '@angular/core';
import { Canvas as CanvasService } from './canvas.service';

@Component({
  selector: 'app-canvas',
  imports: [],
  template: '',
  styles: ``,
})
export class Canvas implements OnInit {
  #canvas = inject(CanvasService);
  async ngOnInit() {
    await this.#canvas.init();
  }
}
