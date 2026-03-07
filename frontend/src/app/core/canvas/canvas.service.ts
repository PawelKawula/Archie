import {
  type ElementRef,
  effect,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import {
  Application,
  Assets,
  type Container,
  type FederatedPointerEvent,
  Sprite,
  Texture,
} from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { ContextMenu } from '../../shared/context-menu.service';
import type { Node } from '../../shared/domain/node';
import { ClusterStore } from '../cluster.store';
import { ConfigurationError } from '../exceptions';
import { Orchestrator } from '../orchestrator.service';

@Injectable({
  providedIn: 'root',
})
export class Canvas {
  private readonly contextMenu = inject(ContextMenu);
  private readonly store = inject(ClusterStore);
  private readonly orchestrator = inject(Orchestrator);

  private _app: Application | null = null;
  private _viewport: Viewport | null = null;
  private readonly _isInitialized = signal(false);

  // Registry to map domain nodes to their visual representations
  private readonly _renderNodes = new Map<string, Container>();

  constructor() {
    this._setupSyncEffect();
  }

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

    await Assets.load('fonts/Hack-Regular/Hack-Regular.fnt');
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

    this._app.stage.eventMode = 'static';
    this._app.stage.on('rightclick', (ev) =>
      this.showContextMenu(ev as FederatedPointerEvent),
    );

    this._isInitialized.set(true);
  }

  private _setupSyncEffect() {
    effect(() => {
      if (!this._isInitialized()) return;

      const nodes = this.store.nodes();
      this._syncNodes(nodes);
    });
  }

  private _syncNodes(nodes: Node[]) {
    const viewport = this.viewport;

    const currentIds = new Set(nodes.map((n) => n.id));

    // 1. Remove nodes that are no longer in state
    for (const [id, container] of this._renderNodes.entries()) {
      if (!currentIds.has(id)) {
        viewport.removeChild(container);
        container.destroy({ children: true });
        this._renderNodes.delete(id);
      }
    }

    // 2. Add or update nodes
    for (const node of nodes) {
      let container = this._renderNodes.get(node.id);

      if (!container) {
        container = this._createNodeGraphics(node);
        viewport.addChild(container);
        this._renderNodes.set(node.id, container);
      }

      // Update position (could be animated later)
      container.position.set(node.x, node.y);
    }
  }

  private _createNodeGraphics(node: Node): Container {
    // For now, simple representation. This should be expanded based on node.type/icon.
    const sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 50;
    sprite.anchor.set(0.5);

    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';

    sprite.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleNodeRightClick(node, event);
    });

    return sprite;
  }

  showContextMenu(event: FederatedPointerEvent) {
    event.preventDefault();
    this.contextMenu.show({ event });
  }
}
