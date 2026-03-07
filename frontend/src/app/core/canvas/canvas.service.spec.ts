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
    expect(() => service.app).toThrow(ConfigurationError);
  });

  it('should error if trying to use viewport before calling init', () => {
    expect(() => service.viewport).toThrow(ConfigurationError);
  });
});
