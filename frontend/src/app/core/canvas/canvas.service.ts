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
  BitmapText,
  Container,
  type FederatedPointerEvent,
  Sprite,
  type Texture,
} from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { ContextMenu } from '../../shared/context-menu.service';
import type { Node } from '../../shared/domain/node';
import { Server } from '../../shared/domain/server';
import { Text } from '../../shared/domain/text';
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

  private async _addNodeToCanvas(node: Node) {
    if (!this._viewport) return;
    if (this._renderNodes.has(node.id)) return;

    const container = await this._createNodeGraphics(node);
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

  private async _createNodeGraphics(node: Node): Promise<Container> {
    if (node instanceof Server) {
      return this._createServerGraphics(node);
    }

    let graphics: Container;
    if (node instanceof Text) {
      graphics = new BitmapText({
        text: node.text,
        style: { fontFamily: 'Hack-Regular.fnt', fontSize: 12, fill: 'ffffff' },
      });
    } else {
      graphics = new BitmapText({
        text: 'Unknown entity type',
        style: { fontFamily: 'Hack-Regular.fnt', fontSize: 12, fill: 'ffffff' },
      });
    }

    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    graphics.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleNodeRightClick(node, event);
    });
    this._setupDrag(node, graphics);

    return graphics;
  }

  private async _createServerGraphics(node: Server): Promise<Container> {
    // SVGs have a 16×16 viewBox; rasterize at 3× devicePixelRatio so the
    // 48 px sprite stays crisp on HiDPI screens (16 × resolution ≥ 48 × dpr).
    const resolution = 4 * (globalThis.devicePixelRatio ?? 1);
    const texture = await Assets.load<Texture>({
      src: node.icon,
      data: { resolution },
    });

    const sprite = new Sprite(texture);
    sprite.width = sprite.height = 48;

    const label = new BitmapText({
      text: node.name,
      style: { fontFamily: 'Hack-Regular.fnt', fontSize: 10, fill: 'ffffff' },
    });
    label.x = 24;
    label.y = 52;
    label.anchor.set(0.5, 0);

    const container = new Container();
    container.addChild(sprite);
    container.addChild(label);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleNodeRightClick(node, event);
    });
    this._setupDrag(node, container);

    return container;
  }

  private _setupDrag(node: Node, container: Container) {
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const onMove = (event: FederatedPointerEvent) => {
      const worldPos = event.getLocalPosition(this.viewport);
      container.position.set(
        worldPos.x - dragOffsetX,
        worldPos.y - dragOffsetY,
      );
    };

    const stopDrag = () => {
      this.app.stage.off('pointermove', onMove);
      this.app.stage.off('pointerup', stopDrag);
      this.viewport.plugins.resume('drag');
      container.cursor = 'pointer';
      node.x = container.x;
      node.y = container.y;
    };

    container.on('pointerdown', (event: FederatedPointerEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const worldPos = event.getLocalPosition(this.viewport);
      dragOffsetX = worldPos.x - container.x;
      dragOffsetY = worldPos.y - container.y;
      this.viewport.plugins.pause('drag');
      this.app.stage.on('pointermove', onMove);
      this.app.stage.on('pointerup', stopDrag);
      container.cursor = 'grabbing';
    });
  }

  showContextMenu(event: FederatedPointerEvent) {
    event.preventDefault();
    this.contextMenu.show({
      event,
      template: this.orchestrator.stageMenuTemplate(),
      data: { x: event.clientX, y: event.clientY },
    });
  }
}
