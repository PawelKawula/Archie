import {
  DestroyRef,
  type ElementRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);

  private _app: Application | null = null;
  private _viewport: Viewport | null = null;
  private readonly _isInitialized = signal(false);

  // Registry to map domain nodes to their visual representations
  private readonly _renderNodes = new Map<string, Container>();

  constructor() {
    this._setupSync();
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

    // Initial sync of existing nodes
    for (const node of this.store.nodes()) {
      this._addNodeToCanvas(node);
    }

    this._isInitialized.set(true);
  }

  private _setupSync() {
    this.store.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!this._isInitialized()) return;

        if (event.type === 'nodeAdded') {
          this._addNodeToCanvas(event.node);
        } else if (event.type === 'nodeRemoved') {
          this._removeNodeFromCanvas(event.nodeId);
        }
      });
  }

  private _addNodeToCanvas(node: Node) {
    if (!this._viewport) return;
    if (this._renderNodes.has(node.id)) return;

    const container = this._createNodeGraphics(node);
    container.position.set(node.x, node.y);
    this._viewport.addChild(container);
    this._renderNodes.set(node.id, container);
  }

  private _removeNodeFromCanvas(nodeId: string) {
    const container = this._renderNodes.get(nodeId);
    if (container && this._viewport) {
      this._viewport.removeChild(container);
      container.destroy({ children: true });
      this._renderNodes.delete(nodeId);
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
