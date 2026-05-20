/// <reference types="jest" />

import { AppService } from './app.service';

describe('AppService', () => {
  it('returns Hola Cambada', () => {
    const service = new AppService();

    expect(service.getHello()).toBe('Hola Cambada!');
  });
});
