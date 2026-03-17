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
  Graphics,
  Sprite,
  type Texture,
} from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { ContextMenu } from '../../shared/context-menu.service';
import type { Connector } from '../../shared/domain/connector';
import type { Node } from '../../shared/domain/node';
import { PacketSource } from '../../shared/domain/packet-source';
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
  private readonly _renderConnections = new Map<string, Graphics>();
  private readonly _connectionLabels = new Map<string, Container>();
  private readonly _connectionTickerCallbacks = new Map<string, () => void>();
  private _nodesLayer: Container | null = null;
  private _connectorsLayer: Container | null = null;
  private readonly _connectors: Connector[] = [];
  private readonly _CONNECTION_OFFSET_SPACING = 30;
  private readonly _NODE_HALF_SIZE = 24;
  private readonly _SERVER_NODE_WIDTH = 160;
  private readonly _SERVER_NODE_HEIGHT = 80;
  private readonly _PACKET_SOURCE_WIDTH = 120;
  private readonly _PACKET_SOURCE_HEIGHT = 70;
  private readonly _abortController = new AbortController();

  constructor() {
    this._setupSync();
    this.destroyRef.onDestroy(() => this._abortController.abort());
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

  get nodesLayer() {
    if (!this._nodesLayer)
      throw new ConfigurationError(
        'Nodes layer is not yet initialized, maybe run inject(Canvas).init()?',
      );
    return this._nodesLayer;
  }

  async init(domContainer: ElementRef) {
    this._app = new Application();

    await this.app.init({
      background: '#1099bb',
      resizeTo: window,
      antialias: true,
    });

    await Assets.load('fonts/Hack-Regular/Hack-Regular.fnt');
    // @ts-expect-error
    globalThis.__PIXI_APP__ = this.app;
    // @ts-expect-error
    globalThis.__archie__ = {
      snapshot: () => this.store.toSnapshot(),
      store: this.store,
    };

    domContainer.nativeElement.appendChild(this.app.canvas);

    this._viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      events: this.app.renderer.events,
    });

    this.app.stage.addChild(this.viewport);

    this.viewport
      .drag({
        mouseButtons: 'middle',
      })
      .pinch()
      .wheel()
      .decelerate();

    this.app.stage.eventMode = 'static';
    this.app.stage.on('rightclick', (ev) =>
      this.showContextMenu(ev as FederatedPointerEvent),
    );
    this._setupLongPress(this.app.stage, (ev) =>
      this.showContextMenu(ev as FederatedPointerEvent),
    );
    this.app.stage.on('pointerdown', (ev) => {
      if (
        ev.button === 0 &&
        this.orchestrator.connectionPickState().step !== 'idle'
      ) {
        this.orchestrator.cancelConnection();
      }
    });
    window.addEventListener(
      'keydown',
      (ev) => {
        if (ev.key === 'Escape') this.orchestrator.cancelConnection();
      },
      { signal: this._abortController.signal },
    );

    this._nodesLayer = new Container();
    this.viewport.addChild(this.nodesLayer);

    this._connectorsLayer = new Container();
    this._connectorsLayer.sortableChildren = true;
    this.viewport.addChild(this._connectorsLayer);

    // Initial sync of existing nodes (must complete before connections are drawn)
    await Promise.all(
      this.store.nodes().map((node) => this._addNodeToCanvas(node)),
    );

    for (const connector of this.store.connections()) {
      this._addConnectionToCanvas(connector);
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
        } else if (event.type === 'nodeUpdated') {
          this._refreshNodeGraphics(event.node);
        } else if (event.type === 'connectionAdded') {
          this._addConnectionToCanvas(event.connection);
        } else if (event.type === 'connectionRemoved') {
          this._removeConnectionFromCanvas(event.connectionId);
        }
      });
  }

  private async _addNodeToCanvas(node: Node) {
    if (this._renderNodes.has(node.id)) return;

    const container = await this._createNodeGraphics(node);
    container.position.set(node.x, node.y);
    this.nodesLayer.addChild(container);
    this._renderNodes.set(node.id, container);
  }

  private _removeNodeFromCanvas(nodeId: string) {
    const toRemove = this._connectors.filter(
      (c) => c.outNode.id === nodeId || c.inNode.id === nodeId,
    );
    for (const connector of toRemove) {
      const gfx = this._renderConnections.get(connector.id);
      if (gfx) {
        gfx.destroy();
        this._renderConnections.delete(connector.id);
      }
      this._destroyConnectionLabel(connector.id);
      this._connectors.splice(this._connectors.indexOf(connector), 1);
    }
    for (const connector of this._connectors) {
      if (
        this._renderNodes.has(connector.outNode.id) &&
        this._renderNodes.has(connector.inNode.id)
      ) {
        this._redrawConnection(connector);
      }
    }

    const container = this._renderNodes.get(nodeId);
    if (container) {
      this.nodesLayer.removeChild(container);
      container.destroy({ children: true });
      this._renderNodes.delete(nodeId);
    }
  }

  private async _refreshNodeGraphics(node: Node): Promise<void> {
    const old = this._renderNodes.get(node.id);
    if (old) {
      this.nodesLayer.removeChild(old);
      old.destroy({ children: true });
      this._renderNodes.delete(node.id);
    }
    const container = await this._createNodeGraphics(node);
    container.position.set(node.x, node.y);
    this.nodesLayer.addChild(container);
    this._renderNodes.set(node.id, container);
    this._redrawConnectionsForNode(node.id);
  }

  private _addConnectionToCanvas(connector: Connector): void {
    if (!this._connectorsLayer) return;
    if (this._renderConnections.has(connector.id)) return;
    const gfx = new Graphics();
    gfx.eventMode = 'static';
    gfx.cursor = 'pointer';
    gfx.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleConnectionRightClick(
        connector,
        event as FederatedPointerEvent,
      );
    });
    gfx.on('pointerdown', (event: FederatedPointerEvent) => {
      if (event.pointerType === 'touch') event.stopPropagation();
    });
    this._setupLongPress(gfx, (event) => {
      this.orchestrator.handleConnectionRightClick(
        connector,
        event as FederatedPointerEvent,
      );
    });
    this._connectorsLayer.addChild(gfx);
    this._renderConnections.set(connector.id, gfx);

    const { label, tick } = this._createConnectionLabel(connector);
    gfx.on('pointerover', () => {
      gfx.zIndex = 1;
      label.zIndex = 1;
    });
    gfx.on('pointerout', () => {
      gfx.zIndex = 0;
      label.zIndex = 0;
    });
    this._connectorsLayer.addChild(label);
    this._connectionLabels.set(connector.id, label);
    this.app.ticker.add(tick);
    this._connectionTickerCallbacks.set(connector.id, tick);

    this._connectors.push(connector);
    this._redrawConnection(connector);
  }

  private _removeConnectionFromCanvas(connectionId: string): void {
    const connector = this._connectors.find((c) => c.id === connectionId);
    if (!connector) return;
    const gfx = this._renderConnections.get(connectionId);
    if (gfx) {
      gfx.destroy();
      this._renderConnections.delete(connectionId);
    }
    this._destroyConnectionLabel(connectionId);
    this._connectors.splice(this._connectors.indexOf(connector), 1);
    for (const c of this._connectors) {
      if (
        this._renderNodes.has(c.outNode.id) &&
        this._renderNodes.has(c.inNode.id)
      ) {
        this._redrawConnection(c);
      }
    }
  }

  private _redrawConnection(connector: Connector): void {
    const gfx = this._renderConnections.get(connector.id);
    if (!gfx) return;
    const outC = this._renderNodes.get(connector.outNode.id);
    const inC = this._renderNodes.get(connector.inNode.id);
    if (!outC || !inC) return;

    gfx.clear();

    const { x: x1, y: y1 } = this._getNodeCenter(connector.outNode, outC);
    const { x: x2, y: y2 } = this._getNodeCenter(connector.inNode, inC);

    const keyA =
      connector.outNode.id < connector.inNode.id
        ? connector.outNode.id
        : connector.inNode.id;
    const keyB =
      connector.outNode.id < connector.inNode.id
        ? connector.inNode.id
        : connector.outNode.id;
    const group = this._connectors.filter((c) => {
      const a = c.outNode.id < c.inNode.id ? c.outNode.id : c.inNode.id;
      const b = c.outNode.id < c.inNode.id ? c.inNode.id : c.outNode.id;
      return a === keyA && b === keyB;
    });
    const count = group.length;
    const index = group.indexOf(connector);

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Canonical sign ensures A→B and B→A arc on opposite sides of the line
    const canonSign = connector.outNode.id < connector.inNode.id ? 1 : -1;
    const px = canonSign * (-dy / len);
    const py = canonSign * (dx / len);
    const offsetMag =
      this._CONNECTION_OFFSET_SPACING * (index - (count - 1) / 2);
    const cpx = mx + px * offsetMag;
    const cpy = my + py * offsetMag;

    gfx
      .moveTo(x1, y1)
      .quadraticCurveTo(cpx, cpy, x2, y2)
      .stroke({ color: 0xffffff, width: 2 });

    const tx = x2 - cpx;
    const ty = y2 - cpy;
    const tlen = Math.sqrt(tx * tx + ty * ty) || 1;
    const tnx = tx / tlen;
    const tny = ty / tlen;
    const ARROW_LEN = 12;
    const ARROW_HALF = 5;
    const bx = x2 - tnx * ARROW_LEN;
    const by = y2 - tny * ARROW_LEN;
    gfx
      .moveTo(x2, y2)
      .lineTo(bx - tny * ARROW_HALF, by + tnx * ARROW_HALF)
      .lineTo(bx + tny * ARROW_HALF, by - tnx * ARROW_HALF)
      .closePath()
      .fill({ color: 0xffffff });

    const label = this._connectionLabels.get(connector.id);
    if (label) {
      // Quadratic bezier point at t=0.5: (P0 + 2*P1 + P2) / 4
      const midX = (x1 + 2 * cpx + x2) / 4;
      const midY = (y1 + 2 * cpy + y2) / 4;
      label.x = midX - label.width / 2;
      label.y = midY - label.height / 2;
    }
  }

  private _createConnectionLabel(connector: Connector): {
    label: Container;
    tick: () => void;
  } {
    const PADDING = 6;
    const LINE_H = 14;
    const W = 90;
    const H = PADDING * 2 + LINE_H * 3;

    const bg = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x1e1e2e })
      .rect(0, 0, W, H)
      .stroke({ color: 0x4a90d9, width: 1 });

    const style = {
      fontFamily: 'Hack-Regular.fnt',
      fontSize: 10,
      fill: 'ffffff',
    };
    const outText = new BitmapText({ text: '', style });
    outText.x = PADDING;
    outText.y = PADDING;

    const transitText = new BitmapText({ text: '', style });
    transitText.x = PADDING;
    transitText.y = PADDING + LINE_H;

    const arrivedText = new BitmapText({ text: '', style });
    arrivedText.x = PADDING;
    arrivedText.y = PADDING + LINE_H * 2;

    const label = new Container();
    label.addChild(bg);
    label.addChild(outText);
    label.addChild(transitText);
    label.addChild(arrivedText);

    const tick = () => {
      const c = connector.connection;
      outText.text = `out:     ${c.outSize}/${c.outMaxSize}`;
      transitText.text = `transit: ${c.transitSize}/${c.transitMaxSize}`;
      arrivedText.text = `arrived: ${c.arrivedSize}/${c.arrivedMaxSize}`;
    };
    tick();

    return { label, tick };
  }

  private _destroyConnectionLabel(connectionId: string): void {
    const tick = this._connectionTickerCallbacks.get(connectionId);
    if (tick) {
      this.app.ticker.remove(tick);
      this._connectionTickerCallbacks.delete(connectionId);
    }
    const label = this._connectionLabels.get(connectionId);
    if (label) {
      label.destroy({ children: true });
      this._connectionLabels.delete(connectionId);
    }
  }

  private _getNodeCenter(
    node: Node,
    container: Container,
  ): { x: number; y: number } {
    if (node instanceof Server) {
      return {
        x: container.x + this._SERVER_NODE_WIDTH / 2,
        y: container.y + this._SERVER_NODE_HEIGHT / 2,
      };
    }
    if (node instanceof PacketSource) {
      return {
        x: container.x + this._PACKET_SOURCE_WIDTH / 2,
        y: container.y + this._PACKET_SOURCE_HEIGHT / 2,
      };
    }
    return {
      x: container.x + this._NODE_HALF_SIZE,
      y: container.y + this._NODE_HALF_SIZE,
    };
  }

  private _redrawConnectionsForNode(nodeId: string): void {
    for (const connector of this._connectors) {
      if (connector.outNode.id === nodeId || connector.inNode.id === nodeId) {
        this._redrawConnection(connector);
      }
    }
  }

  private async _createNodeGraphics(node: Node): Promise<Container> {
    if (node instanceof Server) {
      return this._createServerGraphics(node);
    }
    if (node instanceof PacketSource) {
      return this._createPacketSourceGraphics(node);
    }

    let graphics: Container;
    if (node instanceof Text) {
      graphics = new BitmapText({
        text: node.name,
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
    const W = this._SERVER_NODE_WIDTH;
    const H = this._SERVER_NODE_HEIGHT;
    const ICON_SIZE = 32;
    const PADDING = 10;

    const bg = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x1e1e2e })
      .rect(0, 0, W, H)
      .stroke({ color: 0x4a90d9, width: 2 });

    const nameText = new BitmapText({
      text: node.name,
      style: { fontFamily: 'Hack-Regular.fnt', fontSize: 12, fill: 'ffffff' },
    });
    nameText.x = PADDING;
    nameText.y = PADDING;

    const resolution = 4 * (globalThis.devicePixelRatio ?? 1);
    const texture = await Assets.load<Texture>({
      src: node.icon,
      data: { resolution },
    });
    const sprite = new Sprite(texture);
    sprite.width = sprite.height = ICON_SIZE;
    sprite.x = W - ICON_SIZE - PADDING;
    sprite.y = H - ICON_SIZE - PADDING;

    const highlight = new Graphics()
      .rect(-2, -2, W + 4, H + 4)
      .stroke({ color: 0xffd700, width: 3 });
    highlight.visible = false;

    const container = new Container();
    container.addChild(bg);
    container.addChild(nameText);
    container.addChild(sprite);
    container.addChild(highlight);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerover', () => {
      if (this.orchestrator.connectionPickState().step !== 'idle') {
        highlight.visible = true;
      }
    });
    container.on('pointerout', () => {
      highlight.visible = false;
    });
    container.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleNodeRightClick(node, event);
    });
    this._setupDrag(node, container);

    return container;
  }

  private _createPacketSourceGraphics(node: PacketSource): Container {
    const W = this._PACKET_SOURCE_WIDTH;
    const H = this._PACKET_SOURCE_HEIGHT;
    const PADDING = 8;

    const bg = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x1e1e2e })
      .rect(0, 0, W, H)
      .stroke({ color: 0x4a90d9, width: 2 });

    const nameText = new BitmapText({
      text: node.name,
      style: { fontFamily: 'Hack-Regular.fnt', fontSize: 10, fill: 'ffffff' },
    });
    nameText.x = W / 2 - nameText.width / 2;
    nameText.y = H - PADDING - nameText.height;

    const highlight = new Graphics()
      .rect(-2, -2, W + 4, H + 4)
      .stroke({ color: 0xffd700, width: 3 });
    highlight.visible = false;

    const container = new Container();
    container.addChild(bg);
    container.addChild(nameText);
    container.addChild(highlight);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerover', () => {
      if (this.orchestrator.connectionPickState().step !== 'idle') {
        highlight.visible = true;
      }
    });
    container.on('pointerout', () => {
      highlight.visible = false;
    });
    container.on('rightclick', (event) => {
      event.stopPropagation();
      this.orchestrator.handleNodeRightClick(node, event);
    });
    this._setupDrag(node, container);

    return container;
  }

  private _setupLongPress(
    target: Container,
    handler: (event: FederatedPointerEvent) => void,
  ) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let startX = 0;
    let startY = 0;

    const cancel = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const onMove = (event: FederatedPointerEvent) => {
      if (timer === null) return;
      const dx = event.globalX - startX;
      const dy = event.globalY - startY;
      if (dx * dx + dy * dy > 100) cancel();
    };

    target.on('pointerdown', (event: FederatedPointerEvent) => {
      if (event.pointerType !== 'touch') return;
      startX = event.globalX;
      startY = event.globalY;
      cancel();
      timer = setTimeout(() => {
        timer = null;
        handler(event);
      }, 500);
    });

    target.on('pointermove', onMove);
    target.on('pointerup', cancel);
    target.on('pointerupoutside', cancel);
    target.on('pointercancel', cancel);
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
      this._redrawConnectionsForNode(node.id);
    };

    const stopDrag = () => {
      this.app.stage.off('pointermove', onMove);
      this.app.stage.off('pointerup', stopDrag);
      this.viewport.plugins.resume('drag');
      container.cursor = 'pointer';
      node.x = container.x;
      node.y = container.y;
      this._redrawConnectionsForNode(node.id);
    };

    container.on('pointerdown', (event: FederatedPointerEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();

      if (this.orchestrator.connectionPickState().step !== 'idle') {
        this.orchestrator.pickNodeForConnection(node);
        return;
      }

      const worldPos = event.getLocalPosition(this.viewport);
      dragOffsetX = worldPos.x - container.x;
      dragOffsetY = worldPos.y - container.y;

      if (event.pointerType === 'touch') {
        let longPressTimer: ReturnType<typeof setTimeout> | null = setTimeout(
          () => {
            longPressTimer = null;
            this.app.stage.off('pointermove', onTouchMoveStart);
            this.app.stage.off('pointerup', cancelTouch);
            this.orchestrator.handleNodeRightClick(node, event);
          },
          500,
        );

        const onTouchMoveStart = () => {
          if (longPressTimer !== null) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          this.app.stage.off('pointermove', onTouchMoveStart);
          this.app.stage.off('pointerup', cancelTouch);
          this.viewport.plugins.pause('drag');
          this.app.stage.on('pointermove', onMove);
          this.app.stage.on('pointerup', stopDrag);
          container.cursor = 'grabbing';
        };

        const cancelTouch = () => {
          if (longPressTimer !== null) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          this.app.stage.off('pointermove', onTouchMoveStart);
          this.app.stage.off('pointerup', cancelTouch);
        };

        this.app.stage.on('pointermove', onTouchMoveStart);
        this.app.stage.on('pointerup', cancelTouch);
      } else {
        this.viewport.plugins.pause('drag');
        this.app.stage.on('pointermove', onMove);
        this.app.stage.on('pointerup', stopDrag);
        container.cursor = 'grabbing';
      }
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
