import { TestBed } from '@angular/core/testing';
import { ConfigurationError } from '../exceptions';
import { Canvas } from './canvas.service';

describe('Canvas', () => {
  let service: Canvas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Canvas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should error if trying to use app before calling init', () => {
    assert.throws(() => service.app, ConfigurationError);
  });

  it('should error if trying to use viewport before calling init', () => {
    assert.throws(() => service.app, ConfigurationError);
  });

  it('should not error if trying to use viewport after calling init', () => {
    assert.throws(() => service.app, ConfigurationError);
  });
});
