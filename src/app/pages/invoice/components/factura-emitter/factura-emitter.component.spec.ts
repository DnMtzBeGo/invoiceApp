import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FacturaEmitterComponent } from "./factura-emitter.component";

describe("FacturaEmitterComponent", () => {
  let component: FacturaEmitterComponent;
  let fixture: ComponentFixture<FacturaEmitterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FacturaEmitterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaEmitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
