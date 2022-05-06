import { TestBed } from "@angular/core/testing";

import { CartaPorteInfoService } from "./carta-porte-info.service";

describe("CartaPorteInfoService", () => {
  let service: CartaPorteInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartaPorteInfoService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
