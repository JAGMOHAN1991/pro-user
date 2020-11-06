import { ReadableKeyPipe } from './readable-key.pipe';
import { TestBed } from '@angular/core/testing';
import { TitleCasePipe } from '@angular/common';

describe('ReadableKeyPipe', () => {
  const titleCase = TestBed.get(TitleCasePipe);
  it('create an instance', () => {
    const pipe = new ReadableKeyPipe(titleCase);
    expect(pipe).toBeTruthy();
  });
});
