import { FileExtensionPipe } from "./file-extension.pipe";

describe('fileExtension', () => {
  it('create an instance', () => {
    const pipe = new FileExtensionPipe();
    expect(pipe).toBeTruthy();
  });
});