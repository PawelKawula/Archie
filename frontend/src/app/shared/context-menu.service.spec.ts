import { TestBed } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

import { ContextMenu } from './context-menu.service';

describe('ContextMenu', () => {
  let service: ContextMenu;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextMenu);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit on openMenu$ when show is called', () => {
    const observerSpy = subscribeSpyTo(service.openMenu$);

    const request = {
      event: new PointerEvent('click'),
    };

    service.show(request);

    expect(observerSpy.getLastValue()).toBe(request);
  });
});
