import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FerroviarioComponent } from "./ferroviario.component";

describe("FerroviarioComponent", () => {
  let component: FerroviarioComponent;
  let fixture: ComponentFixture<FerroviarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FerroviarioComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FerroviarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
