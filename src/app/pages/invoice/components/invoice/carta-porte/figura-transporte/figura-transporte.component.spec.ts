import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FiguraTransporteComponent } from "./figura-transporte.component";

describe("FiguraTransporteComponent", () => {
  let component: FiguraTransporteComponent;
  let fixture: ComponentFixture<FiguraTransporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FiguraTransporteComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiguraTransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
