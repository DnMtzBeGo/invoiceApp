import { TestBed } from "@angular/core/testing";

import { CataloguesListService } from "./catalogues-list.service";

describe("CataloguesListService", () => {
  let service: CataloguesListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CataloguesListService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
