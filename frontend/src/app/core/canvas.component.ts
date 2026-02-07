import { Component, type OnInit } from '@angular/core';
import { Application, Sprite, Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

@Component({
  selector: 'app-canvas',
  imports: [],
  template: '',
  styles: ``,
})
export class Canvas implements OnInit {
  async ngOnInit() {
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });
    // @ts-expect-error
    globalThis.__PIXI_APP__ = app;

    document.body.appendChild(app.canvas);
    //
    // app.canvas.style = 'position: fixed; right: 0; top: 0; z-index: -999';

    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);

    viewport.drag().pinch().wheel().decelerate();

    app.stage.addChild(viewport);

    const sprite = viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(100, 100);
  }
}
