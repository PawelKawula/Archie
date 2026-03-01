import { type ElementRef, Injectable, inject } from '@angular/core';
import { Application, Sprite, Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { ContextMenu } from '../../shared/context-menu.service';
import { ConfigurationError } from '../exceptions';

@Injectable({
  providedIn: 'root',
})
export class Canvas {
  contextMenu = inject(ContextMenu);

  private _app: Application | null = null;
  private _viewport: Viewport | null = null;

  get app() {
    if (!this._app)
      throw new ConfigurationError(
        'App is not yet initialized, maybe run inject(Canvas).init()?',
      );
    return this._app;
  }

  get viewport() {
    if (!this._viewport)
      throw new ConfigurationError(
        'Viewport is not yet initialized, maybe run inject(Canvas).init()?',
      );
    return this._viewport;
  }

  async init(domContainer: ElementRef) {
    this._app = new Application();

    await this._app.init({ background: '#1099bb', resizeTo: window });
    // @ts-expect-error
    globalThis.__PIXI_APP__ = this._app;

    domContainer.nativeElement.appendChild(this._app.canvas);

    this._viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      events: this._app.renderer.events,
    });

    this._app.stage.addChild(this._viewport);

    this._viewport
      .drag({
        mouseButtons: 'left',
      })
      .pinch()
      .wheel()
      .decelerate();

    this._app.stage.addChild(this._viewport);

    const sprite = this._viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(100, 100);

    this._app.stage.eventMode = 'static';

    this._app.canvas.addEventListener('contextmenu', (ev) =>
      this.showContextMenu(ev),
    );
  }

  showContextMenu(event: PointerEvent) {
    event.preventDefault();
    console.log(event);
    this.contextMenu.show({ event });
  }
}
