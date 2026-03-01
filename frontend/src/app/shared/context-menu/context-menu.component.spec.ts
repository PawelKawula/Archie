import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ContextMenu as ContextMenuService } from '../context-menu.service';
import { ContextMenu } from './context-menu.component';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;
  let contextMenuService: ContextMenuService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenu],
      providers: [ContextMenuService],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    contextMenuService = TestBed.inject(ContextMenuService);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show context menu on click', async () => {
    const spy = vi.spyOn(component, 'open').mockImplementation(() => {});

    const event = new PointerEvent('contextmenu', {
      clientX: 0,
      clientY: 0,
      screenX: 800,
      screenY: 600,
      bubbles: true,
    });

    contextMenuService.show({ event });

    expect(spy).toHaveBeenCalledOnce();
  });
});
